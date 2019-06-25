import { configure } from '@storybook/vue'
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
Vue.component('no-ssr', {
  template: '<div><slot>No SSR</slot></div>',
})
Vue.component('v-popover', {
  template: '<div><slot>Popover Content</slot></div>',
})

// Automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.story.js$/)

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module)
