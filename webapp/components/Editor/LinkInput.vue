<template>
  <div>
    <ds-input
      id="linkInputId"
      v-model="linkUrl"
      autofocus
      class="editor-menu-link-input"
      placeholder="https://"
      @blur.native.capture="toggleLinkInput()"
      @keydown.native.esc.prevent="toggleLinkInput()"
      @keydown.native.enter.prevent="setLinkUrl(editorCommand, linkUrl)"
    />
  </div>
</template>

<script>
export default {
  props: {
    linkUrl: String,
    editorCommand: Function,
    toggleLinkInput: Function,
    setLinkUrl: Function,
  },
}
</script>
