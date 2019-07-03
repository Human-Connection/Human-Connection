export default {
  head() {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale(),
      },
      bodyAttrs: {
        class: `page-name-${this.$route.name}`,
      },
    }
  },
}
