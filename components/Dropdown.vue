<template>
  <v-popover
    :open.sync="isPopoverOpen"
    :open-group="Math.random().toString()"
    :placement="placement"
    trigger="manual"
    offset="10"
    style="float: right"
  >
    <slot :toggleMenu="toggleMenu" />
    <div
      slot="popover"
      style="padding-top: .5rem; padding-bottom: .5rem;"
      @mouseover="popoverMouseEnter"
      @mouseleave="popoveMouseLeave"
    >
      <slot name="popover" />
    </div>
  </v-popover>
</template>

<script>
import { mapGetters } from 'vuex'

let mouseEnterTimer = null
let mouseLeaveTimer = null

export default {
  props: {
    placement: { type: String, default: 'bottom-end' }
  },
  data() {
    return {
      isPopoverOpen: false
    }
  },
  beforeDestroy() {
    clearTimeout(mouseEnterTimer)
    clearTimeout(mouseLeaveTimer)
  },
  methods: {
    toggleMenu() {
      this.isPopoverOpen = !this.isPopoverOpen
    },
    popoverMouseEnter() {
      clearTimeout(mouseEnterTimer)
      clearTimeout(mouseLeaveTimer)
      if (!this.isPopoverOpen) {
        mouseEnterTimer = setTimeout(() => {
          this.isPopoverOpen = true
        }, 500)
      }
    },
    popoveMouseLeave() {
      clearTimeout(mouseEnterTimer)
      clearTimeout(mouseLeaveTimer)
      if (this.isPopoverOpen) {
        mouseLeaveTimer = setTimeout(() => {
          this.isPopoverOpen = false
        }, 300)
      }
    }
  }
}
</script>
