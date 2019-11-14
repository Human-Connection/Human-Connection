import { addParameters, configure } from '@storybook/vue'
import Vue from 'vue'
import Vuex from 'vuex'
import { action } from '@storybook/addon-actions'

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

// Setup design token addon
const scssReq = require.context('!!raw-loader!~/view/styles', true, /.\.scss$/)
const scssTokenFiles = scssReq
  .keys()
  .map(filename => ({ filename, content: scssReq(filename).default }))

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

configure(loadStories, module)
