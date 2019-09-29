export function scrollToAnchor(anchor) {
  if (!anchor) return
  if (!window || !document) {
    return
  }
  const container = document.querySelector(anchor)
  if (container) {
    const { top } = container.getBoundingClientRect()
    setTimeout(() => {
      // we have to set a small timeout to ensure this part comes after nuxt
      // scrollBehaviour: https://nuxtjs.org/api/configuration-router/#scrollbehavior
      window.scroll({
        top,
        left: 0,
        behavior: 'smooth',
      })
    }, 250)
  }
}

export default {
  watch: {
    $route(to, from) {
      const anchor = to && to.hash
      scrollToAnchor(anchor)
    },
  },
  mounted() {
    const anchor = this.$route && this.$route.hash
    scrollToAnchor(anchor)
  },
}
