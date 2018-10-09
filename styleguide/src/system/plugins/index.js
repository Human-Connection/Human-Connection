import filters from './filters'
import utils from './utils'

export default {
  install(Vue) {
    Vue.use(filters)
    Vue.use(utils)
  }
}
