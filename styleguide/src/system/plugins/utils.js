import copy from 'clipboard-copy'

export default {
  install(Vue) {
    Vue.mixin({
      methods: {
        $copyToClipboard(content) {
          return copy(content)
        }
      }
    })
  }
}
