import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VTooltip from 'v-tooltip'
import Styleguide from '@human-connection/styleguide'
import BaseComponents from '~/plugins/base-components'
import Filters from '~/plugins/vue-filters'
import InfiniteLoading from '~/plugins/vue-infinite-loading'
// import Vuetify from 'vuetify'

global.localVue = createLocalVue()

global.localVue.use(Vuex)
global.localVue.use(VTooltip)
global.localVue.use(Styleguide)
global.localVue.use(BaseComponents)
global.localVue.use(Filters)
global.localVue.use(InfiniteLoading)
// global.localVue.use(Vuetify)
