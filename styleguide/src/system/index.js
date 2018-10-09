import plugins from './plugins'
import components from './components'
import '@@/styles/main.scss'

export default {
  install(Vue) {
    Vue.use(plugins)
    Vue.use(components)
  }
}
