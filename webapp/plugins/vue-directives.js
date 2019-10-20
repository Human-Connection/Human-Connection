import Vue from 'vue'

export default ({ app }) => {
  Vue.directive('focus', {
    // When the bound element is inserted into the DOM...
    inserted: (el, binding) => {
      // Focus the element
      Vue.nextTick(() => {
        if (binding.value !== false) {
          el.focus()
        }
      })
    },
  })

  Vue.directive('router-link', {
    bind: (el, binding) => {
      binding.clickEventListener = e => {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          app.router.push(el.getAttribute('href'))
        }
      }
      el.addEventListener('click', binding.clickEventListener)
    },
    unbind: (el, binding) => {
      // cleanup
      if (binding.clickEventListener) {
        el.removeEventListener('click', binding.clickEventListener)
      }
    },
  })
}
