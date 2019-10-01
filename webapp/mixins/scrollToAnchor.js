import { scrollTo } from 'vue-scrollto'

export default {
  watch: {
    $route(to, from) {
      const anchor = to && to.hash
      if (!this.checkAnchor(anchor)) return
      setTimeout(() => {
        scrollTo(anchor, 1000)
      }, 250)
    },
  },
  mounted() {
    const anchor = this.$route && this.$route.hash
    if (!this.checkAnchor(anchor)) return
    setTimeout(() => {
      scrollTo(anchor, 1000)
    }, 250)
  },
}
