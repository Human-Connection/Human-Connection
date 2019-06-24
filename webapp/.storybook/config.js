import { configure } from '@storybook/vue'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// Automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.story.js$/)

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module)
