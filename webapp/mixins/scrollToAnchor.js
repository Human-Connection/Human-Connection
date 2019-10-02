function scrollToAnchor(anchor, { checkAnchor, $scrollTo }) {
  if (typeof checkAnchor !== 'function')
    throw new Error(
      'You must define `checkAnchor` on the component if you use scrollToAnchor mixin!',
    )
  if (!checkAnchor(anchor)) return
  setTimeout(() => {
    $scrollTo(anchor)
  }, 250)
}

export default {
  watch: {
    $route(to, from) {
      const anchor = to && to.hash
      scrollToAnchor(anchor, this)
    },
  },
  mounted() {
    const anchor = this.$route && this.$route.hash
    scrollToAnchor(anchor, this)
  },
}
