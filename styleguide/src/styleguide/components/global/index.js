// Get components
const context = require.context('.', true, /\.vue$/)

const components = []
context.keys().forEach(key => {
  const c = context(key).default
  components.push(c)
})

export default {
  install(Vue) {
    components.forEach(c => Vue.component(c.name, c))
  }
}
