<template>
  <div class="editor">
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
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import stringHash from 'string-hash'
import {
  Editor,
  EditorContent,
  EditorFloatingMenu,
  EditorMenuBubble
} from 'tiptap'
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
  History
} from 'tiptap-extensions'

let throttleInputEvent

export default {
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble
  },
  props: {
    value: { type: String, default: '' },
    doc: { type: Object, default: () => {} }
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
            emptyNodeText: 'Schreib etwas inspirerendes…'
          }),
          new History()
        ],
        onUpdate: e => {
          clearTimeout(throttleInputEvent)
          throttleInputEvent = setTimeout(() => this.onUpdate(e), 300)
        }
      }),
      linkUrl: null,
      linkMenuIsActive: false
    }
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
      }
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
  methods: {
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
      command({ href: url })
      this.hideLinkMenu()
      this.editor.focus()
    }
  }
}
</script>

<style lang="scss">
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
  }

  // p:not(.is-empty) {
  // br:first-of-type,
  // br:last-of-type {
  //   display: none;
  // }
  // br + br + br {
  //   display: none;
  // }
  // }
}

/*.ProseMirror .is-empty:first-child::before {
  content: 'Füge hier deinen Text ein…';
  position: absolute;
  color: #aaa;
  pointer-events: none;
  height: auto;
  width: auto;
  padding-bottom: $space-small;
  font-style: italic;
}

.editor {
  position: relative;
  border: 1px solid #ddd;
  border-radius: $border-radius;
  line-height: 1.75;
}

.editor:focus-within {
  border: 1px solid rgba($color-primary, 0.5);
}

.menubar {
  margin: $border-radius 0;
}

.editor :matches(p, h1, h2, h3):not(:last-child) {
  padding-bottom: space-xx-small;
}*/

/*
.mark-voice,
.mark-sound,
.mark-quote {
  padding-left: 0.5em;
  padding-right: 0.5em;
  margin-left: -0.25em;
  margin-right: -0.25em;
  border-radius: 1rem;

  &::before {
    display: inline-block;
    content: '[' attr(data-label) '] ';
    opacity: 0.5;
    font-size: 0.5em;
    color: $color-text;
  }
}

.mark-voice {
  background-color: $color-marker-voice;
  font-style: italic;
  color: rgba($color-text, 0.7);
  text-decoration: underline double;
  text-underline-position: under;
}

.mark-sound {
  background-color: $color-marker-sound;
  text-decoration: underline dashed;
  text-underline-position: under;
}

.mark-quote {
  background-color: $color-marker-quote;
  text-decoration: underline dotted;
  text-underline-position: under;
}
*/
</style>
