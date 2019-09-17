<template>
  <div class="editor">
    <menu-bar :editor="editor" :toggleLinkInput="toggleLinkInput" />
    <editor-content ref="editor" :editor="editor" class="ds-input editor-content" />
    <context-menu ref="contextMenu" />
    <suggestion-list
      ref="suggestions"
      :suggestion-type="suggestionType"
      :filtered-items="filteredItems"
      :navigated-item-index="navigatedItemIndex"
      :query="query"
      :select-item="selectItem"
    />
    <link-input
      v-show="isLinkInputActive"
      ref="linkInput"
      :toggle-link-input="toggleLinkInput"
      :set-link-url="setLinkUrl"
    />
  </div>
</template>

<script>
import { Editor, EditorContent } from 'tiptap'
import { History } from 'tiptap-extensions'
import linkify from 'linkify-it'
import stringHash from 'string-hash'
import { replace, build } from 'xregexp/xregexp-all.js'

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
      isLinkInputActive: false,
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
    placeholder() {
      return this.$t('editor.placeholder')
    },
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
        this.$nextTick(() => this.editor.setContent(content))
      },
    },
    placeholder: {
      immediate: true,
      handler: function(val) {
        if (!val || !this.editor) {
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
        // Hashtags must come first, see
        // https://github.com/scrumpy/tiptap/issues/421#issuecomment-523037460
        ...this.optionalExtensions,
        ...defaultExtensions(this),
        new EventHandler(),
        new History(),
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
        return items.slice(0, 15)
      }

      const filteredList = items.filter(item => {
        const itemString = item.slug || item.id
        return itemString.toLowerCase().includes(query.toLowerCase())
      })
      return filteredList.slice(0, 15)
    },
    sanitizeQuery(query) {
      if (this.suggestionType === HASHTAG) {
        // remove all non unicode letters and non digits
        const regexMatchAllNonUnicodeLettersOrDigits = build('[^\\pL0-9]')
        query = replace(query, regexMatchAllNonUnicodeLettersOrDigits, '', 'all')
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
    toggleLinkInput(attrs, element) {
      if (!this.isLinkInputActive && attrs && element) {
        this.$refs.linkInput.linkUrl = attrs.href
        this.isLinkInputActive = true
        this.$refs.contextMenu.displayContextMenu(element, this.$refs.linkInput.$el, 'link')
      } else {
        this.$refs.contextMenu.hideContextMenu()
        this.isLinkInputActive = false
        this.editor.focus()
      }
    },
    setLinkUrl(url) {
      const normalizedLinks = url ? linkify().match(url) : null
      const command = this.editor.commands.link
      if (normalizedLinks) {
        // add valid link
        command({
          href: normalizedLinks.pop().url,
        })
        this.toggleLinkInput()
        this.editor.focus()
      } else {
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
  display: flex;
  flex-direction: column;

  .hashtag {
    color: $color-primary;
  }
  .hashtag-suggestion {
    color: $color-primary;
  }
  .mention-suggestion {
    color: $color-primary;
  }
}

.editor-content {
  flex-grow: 1;
  margin-top: $space-small;
  height: auto;

  &:focus-within {
    border-color: $color-primary;
    background-color: $color-neutral-100;
  }
}

.ProseMirror {
  min-height: 100px;

  &:focus {
    outline: none;
  }

  p {
    margin: 0 0 $space-x-small;
  }
}
</style>
