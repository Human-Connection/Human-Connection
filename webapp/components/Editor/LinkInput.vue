<template>
  <div>
    <ds-input
      id="linkInputId"
      v-model="linkUrl"
      class="editor-menu-link-input"
      placeholder="https://"
      @blur.native.capture="toggleLinkInput()"
      @keydown.native.esc.prevent="toggleLinkInput()"
      @keydown.native.enter.prevent="enterLink()"
    />
  </div>
</template>

<script>
export default {
  props: {
    toggleLinkInput: Function,
    setLinkUrl: Function,
  },
  data() {
    return {
      linkUrl: null,
    }
  },
  methods: {
    enterLink() {
      this.setLinkUrl(this.linkUrl)
      this.linkUrl = null
    },
  },
}
</script>
