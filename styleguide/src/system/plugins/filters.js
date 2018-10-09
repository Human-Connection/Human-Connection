import startCase from 'lodash/startCase'
import camelCase from 'lodash/camelCase'
import kebabCase from 'lodash/kebabCase'

export default {
  install(Vue) {
    Vue.filter('startCase', startCase)
    Vue.filter('camelCase', camelCase)
    Vue.filter('kebabCase', kebabCase)
  }
}
