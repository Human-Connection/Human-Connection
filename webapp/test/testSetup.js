// import fs from 'fs'
// import path from 'path'

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import VTooltip from 'v-tooltip'
import Styleguide from '@human-connection/styleguide'
import BaseComponents from '~/plugins/base-components'
import Filters from '~/plugins/vue-filters'
import InfiniteScroll from '~/plugins/vue-infinite-scroll'

global.localVue = createLocalVue()

global.localVue.use(Vuex)
global.localVue.use(VTooltip)
global.localVue.use(Styleguide)
global.localVue.use(BaseComponents)
global.localVue.use(Filters)
global.localVue.use(InfiniteScroll)

// // import BaseComponents without require.context for tests
// const componentFiles = fs
//   .readdirSync(path.join(__dirname, 'components/_new/generic/'))
//   .filter(fileName => /Base[a-zA-Z]+\.vue/.test(fileName))

// componentFiles.forEach(fileName => {
//   const componentName = fileName.replace(/^.+\//, '').replace('.vue', '')
//   const componentConfig = require('~/components/_new/generic/' + fileName)
//   global.localVue.component(componentName, componentConfig.default || componentConfig)
// })
