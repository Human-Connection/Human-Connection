<template>
  <editor-menu-bar :editor="editor" v-slot="{ commands, isActive, getMarkAttrs }">
    <div>
      <menu-bar-button :isActive="isActive.bold()" :onClick="commands.bold" icon="bold" />

      <menu-bar-button :isActive="isActive.italic()" :onClick="commands.italic" icon="italic" />

      <menu-bar-button
        ref="linkButton"
        :isActive="isActive.link()"
        :onClick="event => toggleLinkInput(getMarkAttrs('link'), event.currentTarget)"
        icon="link"
      />

      <menu-bar-button
        :isActive="isActive.paragraph()"
        :onClick="commands.paragraph"
        icon="paragraph"
      />

      <menu-bar-button
        :isActive="isActive.heading({ level: 3 })"
        :onClick="() => commands.heading({ level: 3 })"
        label="H3"
      />

      <menu-bar-button
        :isActive="isActive.heading({ level: 4 })"
        :onClick="() => commands.heading({ level: 4 })"
        label="H4"
      />

      <menu-bar-button
        :isActive="isActive.bullet_list()"
        :onClick="commands.bullet_list"
        icon="list-ul"
      />

      <menu-bar-button
        :isActive="isActive.ordered_list()"
        :onClick="commands.ordered_list"
        icon="list-ol"
      />

      <menu-bar-button
        :isActive="isActive.blockquote()"
        :onClick="commands.blockquote"
        icon="quote-right"
      />

      <menu-bar-button
        :isActive="isActive.horizontal_rule()"
        :onClick="commands.horizontal_rule"
        icon="minus"
      />
    </div>
  </editor-menu-bar>
</template>

<script>
import { EditorMenuBar } from 'tiptap'
import MenuBarButton from './MenuBarButton'

export default {
  components: {
    EditorMenuBar,
    MenuBarButton,
  },
  props: {
    editor: Object,
    toggleLinkInput: Function,
  },
}
</script>
