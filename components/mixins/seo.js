export default {
  head() {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale()
      }
    }
  }
}
