import { addParameters, configure } from '@storybook/vue'
import Vue from 'vue'
import Vuex from 'vuex'
import { action } from '@storybook/addon-actions'
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!style-loader!css-loader!sass-loader!../assets/_new/styles/resets.scss'

Vue.use(Vuex)
Vue.component('nuxt-link', {
  props: ['to'],
  methods: {
    log() {
      action('link clicked')(this.to)
    },
  },
  template: '<a href="#" @click.prevent="log()"><slot>NuxtLink</slot></a>',
})
Vue.component('client-only', {
  render() {
    return this.$slots.default
  },
})
Vue.component('v-popover', {
  template: '<div><slot>Popover Content</slot></div>',
})

// Globally register base components
const componentFiles = require.context('../components/_new/generic', true, /Base[a-zA-Z]+\.vue/)

componentFiles.keys().forEach((fileName) => {
  const component = componentFiles(fileName)
  const componentConfig = component.default || component
  const componentName = component.name || fileName.replace(/^.+\//, '').replace('.vue', '')

  Vue.component(componentName, componentConfig)
})

// Setup design token addon
const scssReq = require.context('!!raw-loader!~/assets/_new/styles', true, /.\.scss$/)
const scssTokenFiles = scssReq
  .keys()
  .map((filename) => ({ filename, content: scssReq(filename).default }))

addParameters({
  designToken: {
    files: {
      scss: scssTokenFiles,
    },
  },
})

// Automatically import all files ending in *.stories.js
const req = require.context('../components', true, /.story.js$/)

function loadStories() {
  req.keys().forEach(req)
}

// sort stories alphabetically
addParameters({
  options: {
    storySort: (a, b) =>
      a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, { numeric: true }),
  },
})

configure(loadStories, module)
