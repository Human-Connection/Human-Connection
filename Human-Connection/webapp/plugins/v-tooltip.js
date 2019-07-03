import Vue from 'vue'
import VTooltip from 'v-tooltip'

Vue.use(VTooltip, {
  defaultDelay: {
    show: 500,
    hide: 50,
  },
  defaultOffset: 2,
  defaultPopperOptions: {
    removeOnDestroy: true,
  },
  popover: {
    // defaultArrowClass: 'm-dropdown__arrow'
  },
})
