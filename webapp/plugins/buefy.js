import Vue from 'vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy, {
  defaultIconPack: 'fa',
  defaultTooltipAnimated: true,
  defaultTooltipType: 'is-black',
  defaultToastDuration: 6000,
  defaultSnackbarDuration: 5000,
  defaultNoticeQueue: true,
})
