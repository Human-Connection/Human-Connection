import Vue from 'vue'
import Vuex from 'vuex'
import vuexI18n from 'vuex-i18n/dist/vuex-i18n.umd.js'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import layout from './layout.vue'

const helpers = {
  init(options = {}) {
    Vue.use(Vuex)
    Vue.use(Styleguide)
    Vue.use(Filters)

    Vue.use(vuexI18n.plugin, helpers.store)
    Vue.i18n.add('en', require('~/locales/en.json'))
    Vue.i18n.add('de', require('~/locales/de.json'))
    Vue.i18n.set('en')
    Vue.i18n.fallback('en')

    const { plugins = [] } = options
    plugins.forEach(plugin => Vue.use(plugin))
  },
  store: new Vuex.Store({
    modules: {
      auth: {
        namespaced: true,
        getters: {
          user(state) {
            return { id: 1, name: 'admin' }
          },
        },
      },
      editor: {
        namespaced: true,
        getters: {
          placeholder(state) {
            return 'Leave your inspirational thoughts...'
          },
        },
      },
    },
  }),
  layout(storyFn) {
    const ctx = storyFn()
    return {
      components: { ctx, layout },
      template: `
      <layout>
        <ds-flex>
          <ctx />
        </ds-flex>
      </layout>`,
    }
  },
}

export default helpers
