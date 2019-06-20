<template>
  <div class="editor">
    <div v-show="showSuggestions" ref="suggestions" class="suggestion-list">
      <template v-if="usersFilterHasResults">
        <div
          v-for="(user, index) in filteredUsers"
          :key="user.id"
          class="suggestion-list__item"
          :class="{ 'is-selected': navigatedItemIndex === index }"
          @click="selectItem(user, 'mention')"
        >
          @{{ user.slug }}
        </div>
      </template>
      <div v-else class="suggestion-list__item is-empty">
        {{ $t('editor.mention.noUsersFound') }}
      </div>
      <template v-if="tagsFilterHasResults">
        <div
          v-for="(tag, index) in filteredTags"
          :key="tag.id"
          class="suggestion-list__item"
          :class="{ 'is-selected': navigatedItemIndex === index }"
          @click="selectItem(tag, 'tag')"
        >
          #{{ tag.name }}
        </div>
      </template>
      <div v-else class="suggestion-list__item is-empty">{{ $t('editor.tag.noTagsFound') }}</div>
    </div>

    <editor-menu-bubble :editor="editor">
      <div
        ref="menu"
        slot-scope="{ commands, getMarkAttrs, isActive, menu }"
        class="menububble tooltip"
        x-placement="top"
        :class="{ 'is-active': menu.isActive || linkMenuIsActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <div class="tooltip-wrapper">
          <template v-if="linkMenuIsActive">
            <ds-input
              ref="linkInput"
              v-model="linkUrl"
              class="editor-menu-link-input"
              placeholder="http://"
              @blur.native.capture="hideMenu(menu.isActive)"
              @keydown.native.esc.prevent="hideMenu(menu.isActive)"
              @keydown.native.enter.prevent="setLinkUrl(commands.link, linkUrl)"
            />
          </template>
          <template v-else>
            <ds-button
              class="menububble__button"
              size="small"
              :hover="isActive.bold()"
              ghost
              @click.prevent="() => {}"
              @mousedown.native.prevent="commands.bold"
            >
              <ds-icon name="bold" />
            </ds-button>

            <ds-button
              class="menububble__button"
              size="small"
              :hover="isActive.italic()"
              ghost
              @click.prevent="() => {}"
              @mousedown.native.prevent="commands.italic"
            >
              <ds-icon name="italic" />
            </ds-button>

            <ds-button
              class="menububble__button"
              size="small"
              :hover="isActive.link()"
              ghost
              @click.prevent="() => {}"
              @mousedown.native.prevent="showLinkMenu(getMarkAttrs('link'))"
            >
              <ds-icon name="link" />
            </ds-button>
          </template>
        </div>
        <div class="tooltip-arrow" />
      </div>
    </editor-menu-bubble>
    <editor-floating-menu :editor="editor">
      <div
        slot-scope="{ commands, isActive, menu }"
        class="editor__floating-menu"
        :class="{ 'is-active': menu.isActive }"
        :style="`top: ${menu.top}px`"
      >
        <ds-button
          class="menubar__button"
          size="small"
          :ghost="!isActive.paragraph()"
          @click.prevent="commands.paragraph()"
        >
          <ds-icon name="paragraph" />
        </ds-button>

        <ds-button
          class="menubar__button"
          size="small"
          :ghost="!isActive.heading({ level: 3 })"
          @click.prevent="commands.heading({ level: 3 })"
        >
          H3
        </ds-button>

        <ds-button
          class="menubar__button"
          size="small"
          :ghost="!isActive.heading({ level: 4 })"
          @click.prevent="commands.heading({ level: 4 })"
        >
          H4
        </ds-button>

        <ds-button
          class="menubar__button"
          size="small"
          :ghost="!isActive.bullet_list()"
          @click.prevent="commands.bullet_list()"
        >
          <ds-icon name="list-ul" />
        </ds-button>

        <ds-button
          class="menubar__button"
          size="small"
          :ghost="!isActive.ordered_list()"
          @click.prevent="commands.ordered_list()"
        >
          <ds-icon name="list-ol" />
        </ds-button>

        <ds-button
          class="menubar__button"
          size="small"
          :ghost="!isActive.blockquote()"
          @click.prevent="commands.blockquote"
        >
          <ds-icon name="quote-right" />
        </ds-button>

        <ds-button
          class="menubar__button"
          size="small"
          :ghost="!isActive.horizontal_rule()"
          @click.prevent="commands.horizontal_rule"
        >
          <ds-icon name="minus" />
        </ds-button>
      </div>
    </editor-floating-menu>
    <editor-content ref="editor" :editor="editor" />
  </div>
</template>

<script>
import linkify from 'linkify-it'
import stringHash from 'string-hash'
import Fuse from 'fuse.js'
import tippy from 'tippy.js'
import { Editor, EditorContent, EditorFloatingMenu, EditorMenuBubble } from 'tiptap'
import EventHandler from './plugins/eventHandler.js'
import {
  Heading,
  HardBreak,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,
  HorizontalRule,
  Placeholder,
  Bold,
  Italic,
  Strike,
  Underline,
  Link,
  History,
} from 'tiptap-extensions'
import Mention from './nodes/Mention.js'
<<<<<<< HEAD
import Tag from './nodes/Tag.js'
=======
import { mapGetters } from 'vuex'
>>>>>>> origin/master

let throttleInputEvent

export default {
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble,
  },
  props: {
    users: { type: Array, default: () => [] },
    tags: { type: Array, default: () => [] },
    value: { type: String, default: '' },
    doc: { type: Object, default: () => {} },
  },
  data() {
    return {
      lastValueHash: null,
      editor: new Editor({
        content: this.value || '',
        doc: this.doc,
        extensions: [
          new EventHandler(),
          new Heading(),
          new HardBreak(),
          new Blockquote(),
          new BulletList(),
          new OrderedList(),
          new HorizontalRule(),
          new Bold(),
          new Italic(),
          new Strike(),
          new Underline(),
          new Link(),
          new Heading({ levels: [3, 4] }),
          new ListItem(),
          new Placeholder({
            emptyNodeClass: 'is-empty',
            emptyNodeText: this.placeholder || this.$t('editor.placeholder'),
          }),
          new History(),
          new Mention({
            items: () => {
              return this.users
            },
            onEnter: ({ items, query, range, command, virtualNode }) => {
              this.query = query
              this.filteredUsers = items
              this.suggestionRange = range
              this.renderPopup(virtualNode)
              // we save the command for inserting a selected mention
              // this allows us to call it inside of our custom popup
              // via keyboard navigation and on click
              this.insertMention = command
            },
            // is called when a suggestion has changed
            onChange: ({ items, query, range, virtualNode }) => {
              this.query = query
              this.filteredUsers = items
              this.suggestionRange = range
              this.navigatedItemIndex = 0
              this.renderPopup(virtualNode)
            },
            // is called when a suggestion is cancelled
            onExit: () => {
              // reset all saved values
              this.query = null
              this.filteredUsers = []
              this.suggestionRange = null
              this.navigatedItemIndex = 0
              this.destroyPopup()
            },
            // is called on every keyDown event while a suggestion is active
            onKeyDown: ({ event }) => {
              // pressing up arrow
              if (event.keyCode === 38) {
                this.upHandler(this.filteredUsers)
                return true
              }
              // pressing down arrow
              if (event.keyCode === 40) {
                this.downHandler(this.filteredUsers)
                return true
              }
              // pressing enter
              if (event.keyCode === 13) {
                this.enterHandler(this.filteredUsers, 'mention')
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
          new Tag({
            items: () => {
              return this.tags
            },
            onEnter: ({ items, query, range, command, virtualNode }) => {
              this.query = query
              this.filteredTags = items
              this.suggestionRange = range
              this.renderPopup(virtualNode)
              // we save the command for inserting a selected mention
              // this allows us to call it inside of our custom popup
              // via keyboard navigation and on click
              this.insertMention = command
            },
            // is called when a suggestion has changed
            onChange: ({ items, query, range, virtualNode }) => {
              this.query = query
              this.filteredTags = items
              this.suggestionRange = range
              this.navigatedItemIndex = 0
              this.renderPopup(virtualNode)
            },
            // is called when a suggestion is cancelled
            onExit: () => {
              // reset all saved values
              this.query = null
              this.filteredTags = []
              this.suggestionRange = null
              this.navigatedItemIndex = 0
              this.destroyPopup()
            },
            // is called on every keyDown event while a suggestion is active
            onKeyDown: ({ event }) => {
              // pressing up arrow
              if (event.keyCode === 38) {
                this.upHandler(this.filteredTags)
                return true
              }
              // pressing down arrow
              if (event.keyCode === 40) {
                this.downHandler(this.filteredTags)
                return true
              }
              // pressing enter
              if (event.keyCode === 13) {
                this.enterHandler(this.filteredTags, 'tag')
                return true
              }
              // pressing space
              if (event.keyCode === 32) {
                // this.enterHandler(this.filteredTags, 'tag')
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
        ],
        onUpdate: e => {
          clearTimeout(throttleInputEvent)
          throttleInputEvent = setTimeout(() => this.onUpdate(e), 300)
        },
      }),
      linkUrl: null,
      linkMenuIsActive: false,
      query: null,
      suggestionRange: null,
      filteredUsers: [],
      filteredTags: [],
      navigatedItemIndex: 0,
      insertMention: () => {},
      observer: null,
    }
  },
  computed: {
<<<<<<< HEAD
    usersFilterHasResults() {
      return this.filteredUsers.length > 0
    },
    tagsFilterHasResults() {
      return this.filteredTags.length > 0
=======
    ...mapGetters({ placeholder: 'editor/placeholder' }),
    hasResults() {
      return this.filteredUsers.length
>>>>>>> origin/master
    },
    showSuggestions() {
      return this.query || this.usersFilterHasResults || this.tagsFilterHasResults
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
    // navigate to the previous item
    // if it's the first item, navigate to the last one
    upHandler(filteredArray) {
      this.navigatedItemIndex =
        (this.navigatedItemIndex + this.filteredArray.length - 1) % this.filteredArray.length
    },
    // navigate to the next item
    // if it's the last item, navigate to the first one
    downHandler(filteredArray) {
      this.navigatedItemIndex = (this.navigatedItemIndex + 1) % this.filteredArray.length
    },
    enterHandler(filteredArray, type) {
      const item = this.filteredArray[this.navigatedItemIndex]
      if (item) {
        this.selectItem(item, type)
      }
    },
    // we have to replace our suggestion text with a mention
    // so it's important to pass also the position of your suggestion text
    selectItem(item, type) {
      const typeAttrs = {
        mention: {
          // TODO: use router here
          url: `/profile/${item.id}`,
          label: item.slug,
        },
        tag: {
          // TODO: Fill up with input tag in search field
          url: `/search/hashtag:${item.name}`,
          label: item.name,
        },
      }
      this.insertMention({
        range: this.suggestionRange,
        attrs: typeAttrs[type],
      })
      this.editor.focus()
    },
    // renders a popup with suggestions
    // tiptap provides a virtualNode object for using popper.js (or tippy.js) for popups
    renderPopup(node) {
      if (this.popup) {
        return
      }
      this.popup = tippy(node, {
        content: this.$refs.suggestions,
        trigger: 'mouseenter',
        interactive: true,
        theme: 'dark',
        placement: 'top-start',
        inertia: true,
        duration: [400, 200],
        showOnInit: true,
        arrow: true,
        arrowType: 'round',
      })
      // we have to update tippy whenever the DOM is updated
      if (MutationObserver) {
        this.observer = new MutationObserver(() => {
          this.popup.popperInstance.scheduleUpdate()
        })
        this.observer.observe(this.$refs.suggestions, {
          childList: true,
          subtree: true,
          characterData: true,
        })
      }
    },
    destroyPopup() {
      if (this.popup) {
        this.popup.destroy()
        this.popup = null
      }
      if (this.observer) {
        this.observer.disconnect()
      }
    },
    onUpdate(e) {
      const content = e.getHTML()
      const contentHash = stringHash(content)
      if (contentHash !== this.lastValueHash) {
        this.lastValueHash = contentHash
        this.$emit('input', content)
      }
    },
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href
      this.linkMenuIsActive = true
      this.$nextTick(() => {
        try {
          const $el = this.$refs.linkInput.$el.getElementsByTagName('input')[0]
          $el.focus()
          $el.select()
        } catch (err) {}
      })
    },
    hideLinkMenu() {
      this.linkUrl = null
      this.linkMenuIsActive = false
      this.editor.focus()
    },
    hideMenu(isActive) {
      isActive = false
      this.hideLinkMenu()
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

.ProseMirror {
  padding: $space-base;
  margin: -$space-base;
  min-height: $space-large;
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
  .tag {
    color: $color-primary;
  }
  .tag-suggestion {
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
