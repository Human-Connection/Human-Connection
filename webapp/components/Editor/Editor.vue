<template>
  <div class="editor">
    <menu-bar :editor="editor" :showLinkMenu="showLinkMenu" />
    <editor-content ref="editor" :editor="editor" />
    <context-menu ref="contextMenu" />
    <suggestion-list
      ref="suggestions"
      :suggestion-type="suggestionType"
      :filtered-items="filteredItems"
      :navigated-item-index="navigatedItemIndex"
      :query="query"
      :select-item="selectItem"
    />
    <link-input v-show="linkMenuIsActive" ref="linkMenu" :editorCommand="editor.commands.link" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Editor, EditorContent } from 'tiptap'
import { History } from 'tiptap-extensions'
import linkify from 'linkify-it'
import stringHash from 'string-hash'

import * as key from '../../constants/keycodes'
import { HASHTAG, MENTION } from '../../constants/editor'
import defaultExtensions from './defaultExtensions.js'
import EventHandler from './plugins/eventHandler.js'
import Hashtag from './nodes/Hashtag.js'
import Mention from './nodes/Mention.js'
import MenuBar from './MenuBar'
import ContextMenu from './ContextMenu'
import SuggestionList from './SuggestionList'
import LinkInput from './LinkInput'

let throttleInputEvent

export default {
  components: {
    ContextMenu,
    EditorContent,
    LinkInput,
    MenuBar,
    SuggestionList,
  },
  props: {
    users: { type: Array, default: () => null }, // If 'null', than the Mention extention is not assigned.
    hashtags: { type: Array, default: () => null }, // If 'null', than the Hashtag extention is not assigned.
    value: { type: String, default: '' },
    doc: { type: Object, default: () => {} },
  },
  data() {
    return {
      lastValueHash: null,
      editor: null,
      linkUrl: null,
      linkMenuIsActive: false,
      suggestionType: '',
      query: null,
      suggestionRange: null,
      filteredItems: [],
      navigatedItemIndex: 0,
      insertMentionOrHashtag: () => {},
      observer: null,
    }
  },
  computed: {
    ...mapGetters({ placeholder: 'editor/placeholder' }),
    optionalExtensions() {
      const extensions = []
      // Don't change the following line. The functionallity is in danger!
      if (this.users) {
        extensions.push(
          new Mention({
            items: () => {
              return this.users
            },
            onEnter: props => this.openSuggestionList(props, MENTION),
            onChange: this.updateSuggestionList,
            onExit: this.closeSuggestionList,
            onKeyDown: this.navigateSuggestionList,
            onFilter: this.filterSuggestionList,
          }),
        )
      }
      // Don't change the following line. The functionallity is in danger!
      if (this.hashtags) {
        extensions.push(
          new Hashtag({
            items: () => {
              return this.hashtags
            },
            onEnter: props => this.openSuggestionList(props, HASHTAG),
            onChange: this.updateSuggestionList,
            onExit: this.closeSuggestionList,
            onKeyDown: this.navigateSuggestionList,
            onFilter: this.filterSuggestionList,
          }),
        )
      }
      return extensions
    },
  },
  watch: {
    value: {
      immediate: true,
      handler: function(content, old) {
        const contentHash = stringHash(content)
        if (!content || contentHash === this.lastValueHash) {
          return
        }
        this.lastValueHash = contentHash
        this.editor.setContent(content)
      },
    },
    placeholder: {
      immediate: true,
      handler: function(val) {
        if (!val) {
          return
        }
        this.editor.extensions.options.placeholder.emptyNodeText = val
      },
    },
  },
  created() {
    this.editor = new Editor({
      content: this.value || '',
      doc: this.doc,
      extensions: [
        ...defaultExtensions(this),
        new EventHandler(),
        new History(),
        ...this.optionalExtensions,
      ],
      onUpdate: e => {
        clearTimeout(throttleInputEvent)
        throttleInputEvent = setTimeout(() => this.onUpdate(e), 300)
      },
    })
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
    openSuggestionList({ items, query, range, command, virtualNode }, suggestionType) {
      this.suggestionType = suggestionType

      this.query = this.sanitizeQuery(query)
      this.filteredItems = items
      this.suggestionRange = range
      this.$refs.contextMenu.displayContextMenu(virtualNode, this.$refs.suggestions.$el)
      this.insertMentionOrHashtag = command
    },
    updateSuggestionList({ items, query, range, virtualNode }) {
      this.query = this.sanitizeQuery(query)
      this.filteredItems = items
      this.suggestionRange = range
      this.navigatedItemIndex = 0
      this.$refs.contextMenu.displayContextMenu(virtualNode, this.$refs.suggestions.$el)
    },
    closeSuggestionList() {
      this.suggestionType = ''
      this.query = null
      this.filteredItems = []
      this.suggestionRange = null
      this.navigatedItemIndex = 0
      this.$refs.contextMenu.hideContextMenu()
    },
    navigateSuggestionList({ event }) {
      const item = this.filteredItems[this.navigatedItemIndex]

      switch (event.keyCode) {
        case key.ARROW_UP:
          this.navigatedItemIndex =
            (this.navigatedItemIndex + this.filteredItems.length - 1) % this.filteredItems.length
          return true

        case key.ARROW_DOWN:
          this.navigatedItemIndex = (this.navigatedItemIndex + 1) % this.filteredItems.length
          return true

        case key.RETURN:
          if (item) {
            this.selectItem(item)
          }
          return true

        case key.SPACE:
          if (this.suggestionType === HASHTAG && this.query !== '') {
            this.selectItem({ id: this.query })
          }
          return true

        default:
          return false
      }
    },
    filterSuggestionList(items, query) {
      query = this.sanitizeQuery(query)
      if (!query) {
        return items
      }
      return items.filter(item => {
        const itemString = item.slug || item.id
        return itemString.toLowerCase().includes(query.toLowerCase())
      })
    },
    sanitizeQuery(query) {
      if (this.suggestionType === HASHTAG) {
        // remove all not allowed chars
        query = query.replace(/[^a-zA-Z0-9]/gm, '')
        // if the query is only made of digits, make it empty
        return query.replace(/[0-9]/gm, '') === '' ? '' : query
      }
      return query
    },
    // we have to replace our suggestion text with a mention
    // so it's important to pass also the position of your suggestion text
    selectItem(item) {
      const typeAttrs = {
        mention: {
          id: item.id,
          label: item.slug,
        },
        hashtag: {
          id: item.id,
          label: item.id,
        },
      }
      this.insertMentionOrHashtag({
        range: this.suggestionRange,
        attrs: typeAttrs[this.suggestionType],
      })
      this.editor.focus()
    },
    onUpdate(e) {
      const content = e.getHTML()
      const contentHash = stringHash(content)
      if (contentHash !== this.lastValueHash) {
        this.lastValueHash = contentHash
        this.$emit('input', content)
      }
    },
    showLinkMenu(attrs, element) {
      this.linkUrl = attrs.href
      this.linkMenuIsActive = true
      this.$refs.contextMenu.displayContextMenu(element, this.$refs.linkMenu.$el, 'click')
      this.$nextTick(() => {
        try {
          const input = this.$refs.linkMenu.$el.querySelector('input')
          input.focus()
          input.select()
        } catch (err) {}
      })
    },
    hideLinkMenu() {
      this.$refs.contextMenu.hideContextMenu()
      this.linkUrl = null
      this.linkMenuIsActive = false
      this.editor.focus()
    },
    setLinkUrl(command, url) {
      const links = linkify().match(url)
      if (links) {
        // add valid link
        command({
          href: links.pop().url,
        })
        this.hideLinkMenu()
        this.editor.focus()
      } else if (!url) {
        // remove link
        command({ href: null })
      }
    },
    clear() {
      this.editor.clearContent(true)
    },
  },
}
</script>

<style lang="scss">
.tippy-tooltip.dark-theme {
  background-color: $color-neutral-0;
  padding: 0;
  font-size: 1rem;
  text-align: inherit;
  color: $color-neutral-100;
  border-radius: 5px;
  .tippy-backdrop {
    display: none;
  }

  .tippy-roundarrow {
    fill: $color-neutral-0;
  }
  .tippy-popper[x-placement^='top'] & .tippy-arrow {
    border-top-color: $color-neutral-0;
  }
  .tippy-popper[x-placement^='bottom'] & .tippy-arrow {
    border-bottom-color: $color-neutral-0;
  }
  .tippy-popper[x-placement^='left'] & .tippy-arrow {
    border-left-color: $color-neutral-0;
  }
  .tippy-popper[x-placement^='right'] & .tippy-arrow {
    border-right-color: $color-neutral-0;
  }
}

.ProseMirror:focus {
  outline: none;
}

.editor p.is-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: $text-color-disabled;
  padding-left: $space-xx-small;
  pointer-events: none;
  height: 0;
}

.menubar__button {
  font-weight: normal;
}

li > p {
  margin-top: $space-xx-small;
  margin-bottom: $space-xx-small;
}

.editor {
  .mention-suggestion {
    color: $color-primary;
  }
  .hashtag {
    color: $color-primary;
  }
  .hashtag-suggestion {
    color: $color-primary;
  }
  &__floating-menu {
    position: absolute;
    margin-top: -0.25rem;
    margin-left: $space-xx-small;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s, visibility 0.2s;
    background-color: #fff;

    &.is-active {
      opacity: 1;
      visibility: visible;
    }
  }
  .menububble {
    position: absolute;
    // margin-top: -0.5rem;
    visibility: hidden;
    opacity: 0;
    transition: opacity 200ms, visibility 200ms;
    // transition-delay: 50ms;
    transform: translate(-50%, -10%);

    background-color: $background-color-inverse-soft;
    // color: $text-color-inverse;
    border-radius: $border-radius-base;
    padding: $space-xx-small;
    box-shadow: $box-shadow-large;

    .ds-button {
      color: $text-color-inverse;

      &.ds-button-hover,
      &:hover {
        color: $text-color-base;
      }
    }

    &.is-active {
      opacity: 1;
      visibility: visible;
    }

    .tooltip-arrow {
      left: calc(50% - 10px);
    }

    input,
    button {
      border: none;
      border-radius: 2px;
    }

    .ds-input {
      height: auto;
    }
    input {
      padding: $space-xx-small $space-x-small;
    }
  }
}
</style>
