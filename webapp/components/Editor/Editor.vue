<template>
  <div class="editor">
    <menu-bar :editor="editor" :showLinkMenu="showLinkMenu" />
    <editor-content ref="editor" :editor="editor" />
    <context-menu ref="contextMenu" />
    <suggestion-list
      :showSuggestions="showSuggestions"
      ref="suggestions"
      :filtered-items="filteredItems"
      :navigated-item-index="navigatedItemIndex"
      :query="query"
      :select-item="selectItem"
      :is-mention="isMention"
      :is-hashtag="isHashtag"
      :has-results="hasResults"
    />
    <link-input v-show="linkMenuIsActive" ref="linkMenu" :editorCommand="editor.commands.link" />
  </div>
</template>

<script>
import defaultExtensions from './defaultExtensions.js'
import linkify from 'linkify-it'
import stringHash from 'string-hash'
import Fuse from 'fuse.js'
import { Editor, EditorContent } from 'tiptap'
import EventHandler from './plugins/eventHandler.js'
import { History } from 'tiptap-extensions'
import Hashtag from './nodes/Hashtag.js'
import Mention from './nodes/Mention.js'
import { mapGetters } from 'vuex'
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
    // Set array of optional extensions by analysing the props.
    let optionalExtensions = []
    // Don't change the following line. The functionallity is in danger!
    if (this.users) {
      optionalExtensions.push(
        new Mention({
          // a list of all suggested items
          items: () => {
            return this.users
          },
          // is called when a suggestion starts
          onEnter: ({ items, query, range, command, virtualNode }) => {
            this.suggestionType = this.mentionSuggestionType

            this.query = query
            this.filteredItems = items
            this.suggestionRange = range
            this.$refs.contextMenu.displayContextMenu(virtualNode, this.$refs.suggestions.$el)
            // we save the command for inserting a selected mention
            // this allows us to call it inside of our custom popup
            // via keyboard navigation and on click
            this.insertMentionOrHashtag = command
          },
          // is called when a suggestion has changed
          onChange: ({ items, query, range, virtualNode }) => {
            this.query = query
            this.filteredItems = items
            this.suggestionRange = range
            this.navigatedItemIndex = 0
            this.$refs.contextMenu.displayContextMenu(virtualNode, this.$refs.suggestions.$el)
          },
          // is called when a suggestion is cancelled
          onExit: () => {
            this.suggestionType = this.nullSuggestionType

            // reset all saved values
            this.query = null
            this.filteredItems = []
            this.suggestionRange = null
            this.navigatedItemIndex = 0
            this.$refs.contextMenu.hideContextMenu()
          },
          // is called on every keyDown event while a suggestion is active
          onKeyDown: ({ event }) => {
            // pressing up arrow
            if (event.keyCode === 38) {
              this.upHandler()
              return true
            }
            // pressing down arrow
            if (event.keyCode === 40) {
              this.downHandler()
              return true
            }
            // pressing enter
            if (event.keyCode === 13) {
              this.enterHandler()
              return true
            }
            return false
          },
          // is called when a suggestion has changed
          // this function is optional because there is basic filtering built-in
          // you can overwrite it if you prefer your own filtering
          // in this example we use fuse.js with support for fuzzy search
          onFilter: (items, query) => {
            if (!query) {
              return items
            }
            const fuse = new Fuse(items, {
              threshold: 0.2,
              keys: ['slug'],
            })
            return fuse.search(query)
          },
        }),
      )
    }
    // Don't change the following line. The functionallity is in danger!
    if (this.hashtags) {
      optionalExtensions.push(
        new Hashtag({
          // a list of all suggested items
          items: () => {
            return this.hashtags
          },
          // is called when a suggestion starts
          onEnter: ({ items, query, range, command, virtualNode }) => {
            this.suggestionType = this.hashtagSuggestionType

            this.query = this.sanitizedQuery(query)
            this.filteredItems = items
            this.suggestionRange = range
            this.$refs.contextMenu.displayContextMenu(virtualNode, this.$refs.suggestions.$el)
            // we save the command for inserting a selected mention
            // this allows us to call it inside of our custom popup
            // via keyboard navigation and on click
            this.insertMentionOrHashtag = command
          },
          // is called when a suggestion has changed
          onChange: ({ items, query, range, virtualNode }) => {
            this.query = this.sanitizedQuery(query)
            this.filteredItems = items
            this.suggestionRange = range
            this.navigatedItemIndex = 0
            this.$refs.contextMenu.displayContextMenu(virtualNode, this.$refs.suggestions.$el)
          },
          // is called when a suggestion is cancelled
          onExit: () => {
            this.suggestionType = this.nullSuggestionType

            // reset all saved values
            this.query = null
            this.filteredItems = []
            this.suggestionRange = null
            this.navigatedItemIndex = 0
            this.$refs.contextMenu.hideContextMenu()
          },
          // is called on every keyDown event while a suggestion is active
          onKeyDown: ({ event }) => {
            // pressing up arrow
            if (event.keyCode === 38) {
              this.upHandler()
              return true
            }
            // pressing down arrow
            if (event.keyCode === 40) {
              this.downHandler()
              return true
            }
            // pressing enter
            if (event.keyCode === 13) {
              this.enterHandler()
              return true
            }
            // pressing space
            if (event.keyCode === 32) {
              this.spaceHandler()
              return true
            }
            return false
          },
          // is called when a suggestion has changed
          // this function is optional because there is basic filtering built-in
          // you can overwrite it if you prefer your own filtering
          // in this example we use fuse.js with support for fuzzy search
          onFilter: (items, query) => {
            query = this.sanitizedQuery(query)
            if (!query) {
              return items
            }
            return items.filter(item =>
              JSON.stringify(item)
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
          },
        }),
      )
    }

    return {
      lastValueHash: null,
      editor: new Editor({
        content: this.value || '',
        doc: this.doc,
        extensions: [
          ...defaultExtensions(this),
          new EventHandler(),
          new History(),
          ...optionalExtensions,
        ],
        onUpdate: e => {
          clearTimeout(throttleInputEvent)
          throttleInputEvent = setTimeout(() => this.onUpdate(e), 300)
        },
      }),
      linkUrl: null,
      linkMenuIsActive: false,
      nullSuggestionType: '',
      mentionSuggestionType: 'mention',
      hashtagSuggestionType: 'hashtag',
      suggestionType: this.nullSuggestionType,
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
    hasResults() {
      return this.filteredItems.length
    },
    showSuggestions() {
      return this.query || this.hasResults
    },
    isMention() {
      return this.suggestionType === this.mentionSuggestionType
    },
    isHashtag() {
      return this.suggestionType === this.hashtagSuggestionType
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
  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
    sanitizedQuery(query) {
      // remove all not allowed chars
      query = query.replace(/[^a-zA-Z0-9]/gm, '')
      // if the query is only made of digits, make it empty
      return query.replace(/[0-9]/gm, '') === '' ? '' : query
    },
    // navigate to the previous item
    // if it's the first item, navigate to the last one
    upHandler() {
      this.navigatedItemIndex =
        (this.navigatedItemIndex + this.filteredItems.length - 1) % this.filteredItems.length
    },
    // navigate to the next item
    // if it's the last item, navigate to the first one
    downHandler() {
      this.navigatedItemIndex = (this.navigatedItemIndex + 1) % this.filteredItems.length
    },
    // Handles pressing of enter.
    enterHandler() {
      const item = this.filteredItems[this.navigatedItemIndex]
      if (item) {
        this.selectItem(item)
      }
    },
    // For hashtags handles pressing of space.
    spaceHandler() {
      if (this.suggestionType === this.hashtagSuggestionType && this.query !== '') {
        this.selectItem({ id: this.query })
      }
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
.suggestion-list {
  padding: 0.2rem;
  border: 2px solid rgba($color-neutral-0, 0.1);
  font-size: 0.8rem;
  font-weight: bold;
  &__no-results {
    padding: 0.2rem 0.5rem;
  }
  &__item {
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
    margin-bottom: 0.2rem;
    cursor: pointer;
    &:last-child {
      margin-bottom: 0;
    }
    &.is-selected,
    &:hover {
      background-color: rgba($color-neutral-100, 0.2);
    }
    &.is-empty {
      opacity: 0.5;
    }
  }
}

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
