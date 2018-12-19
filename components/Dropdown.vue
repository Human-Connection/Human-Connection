<template>
  <v-popover
    :open.sync="isPopoverOpen"
    :open-group="Math.random().toString()"
    :placement="placement"
    trigger="manual"
    :offset="offset"
  >
    <slot :toggleMenu="toggleMenu" />
    <div
      slot="popover"
      @mouseover="popoverMouseEnter"
      @mouseleave="popoveMouseLeave"
    >
      <slot
        name="popover"
        :toggleMenu="toggleMenu"
      />
    </div>
  </v-popover>
</template>

<script>
import { mapGetters } from 'vuex'

let mouseEnterTimer = null
let mouseLeaveTimer = null

export default {
  props: {
    placement: { type: String, default: 'bottom-end' },
    offset: { type: [String, Number], default: '16' }
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
