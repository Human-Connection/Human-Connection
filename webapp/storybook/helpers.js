import Vue from 'vue'
import Vuex from 'vuex'
import faker from 'faker'
import vuexI18n from 'vuex-i18n/dist/vuex-i18n.umd.js'
import Styleguide from '@human-connection/styleguide'
import Filters from '~/plugins/vue-filters'
import Directives from '~/plugins/vue-directives'
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
    Vue.use(Directives)

    Vue.use(vuexI18n.plugin, helpers.store)
    locales.forEach(({ code }) => {
      Vue.i18n.add(code, require(`~/locales/${code}.json`))
    })

    Vue.i18n.set('en')
    Vue.i18n.fallback('en')

    const { plugins = [] } = options
    plugins.forEach((plugin) => Vue.use(plugin))
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
          user() {
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
  fakeUser(n) {
    return new Array(n || 1).fill(0).map(() => {
      const name = faker.name.findName()
      return {
        id: faker.random.uuid(),
        name,
        slug: faker.helpers.slugify(name),
      }
    })
  },
  fakePost(n) {
    return new Array(n || 1).fill(0).map(() => {
      const title = faker.lorem.words()
      const content = faker.lorem.paragraph()
      return {
        id: faker.random.uuid(),
        title,
        content,
        slug: faker.lorem.slug(title),
        shoutedCount: faker.random.number(),
        commentsCount: faker.random.number(),
      }
    })
  },
}

export default helpers
