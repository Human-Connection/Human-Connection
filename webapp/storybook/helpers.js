import Vue from 'vue'
import Vuex from 'vuex'
import vuexI18n from 'vuex-i18n/dist/vuex-i18n.umd.js'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import IziToast from '~/plugins/izi-toast'
import layout from './layout.vue'
import locales from '~/locales/index.js'

import '~/plugins/v-tooltip'

const helpers = {
  init(options = {}) {
    Vue.use(Vuex)
    Vue.use(Styleguide)
    Vue.use(Filters)
    Vue.use(IziToast)

    Vue.use(vuexI18n.plugin, helpers.store)
    locales.forEach(({ code }) => {
      Vue.i18n.add(code, require(`~/locales/${code}.json`))
    })

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
          isModerator() {
            return true
          },
          isAdmin() {
            return true
          },
          user(state) {
            return { id: '1', name: 'admin', slug: 'admin' }
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
