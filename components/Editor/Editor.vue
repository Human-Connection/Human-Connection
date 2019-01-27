<template>
  <div class="editor">
    <editor-menu-bubble :editor="editor">
      <div
        slot-scope="{ commands, isActive, menu }"
        class="menububble tooltip"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <ds-button
          class="menububble__button"
          size="small"
          :hover="isActive.bold()"
          ghost
          @click.prevent="commands.bold"
        >
          <ds-icon name="bold" />
        </ds-button>

        <ds-button
          class="menububble__button"
          size="small"
          :hover="isActive.italic()"
          ghost
          @click.prevent="commands.italic"
        >
          <ds-icon name="italic" />
        </ds-button>
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
          :ghost="!isActive.heading({ level: 2 })"
          @click.prevent="commands.heading({ level: 2 })"
        >
          H2
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
          new Heading({ levels: [2, 3] }),
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
      })
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
        // content = content
        //   .replace(/(<br\s*\/*>\s*){2,}/gim, '<br/>')
        //   .replace(/<\/p>\s*(<br\s*\/*>\s*)+\s*<p>/gim, '</p><p>')
        //   .replace(/<p>\s*(<br\s*\/*>\s*)+\s*<\/p>/gim, '')
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
    }
  }
}
</script>

<style lang="scss">
.ProseMirror {
  padding: $space-small;
  min-height: $space-large;
}

.ProseMirror:focus {
  outline: none;
}

.editor p.is-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: $text-color-softer;
  padding-left: $space-base;
  pointer-events: none;
  height: 0;
  font-style: italic;
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
    margin-left: $space-base;
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
    transition: all 0.2s;
    transition-delay: 150ms;
    transform: translate(-50%, -25%);

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
