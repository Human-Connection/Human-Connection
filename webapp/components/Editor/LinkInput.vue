<template>
  <div>
    <ds-input
      v-model="linkUrl"
      class="editor-menu-link-input"
      placeholder="https://"
      @blur.native.capture="hideLinkMenu()"
      @keydown.native.esc.prevent="hideLinkMenu()"
      @keydown.native.enter.prevent="setLinkUrl(editorCommand, linkUrl)"
    />
  </div>
</template>

<script>
export default {
  props: ['hideLinkMenu', 'setLinkUrl', 'editorCommand'],
  data() {
    return {
      linkUrl: null,
    }
  },
}
</script>
