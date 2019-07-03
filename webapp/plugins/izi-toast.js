import Vue from 'vue'
import VueIziToast from 'vue-izitoast'

import 'izitoast/dist/css/iziToast.css'

export default ({ app }) => {
  Vue.use(VueIziToast, {
    position: 'bottomRight',
    transitionIn: 'bounceInLeft',
    layout: 2,
    theme: 'dark',
  })
}
