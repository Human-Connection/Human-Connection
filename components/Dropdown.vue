<template>
  <v-popover
    :open.sync="isPopoverOpen"
    :open-group="Math.random().toString()"
    :placement="placement"
    :disabled="disabled"
    trigger="manual"
    :offset="offset"
  >
    <slot
      :toggleMenu="toggleMenu"
      :openMenu="openMenu"
      :closeMenu="closeMenu"
      :isOpen="isOpen"
    />
    <div
      slot="popover"
      @mouseover="popoverMouseEnter"
      @mouseleave="popoveMouseLeave"
    >
      <slot
        name="popover"
        :toggleMenu="toggleMenu"
        :openMenu="openMenu"
        :closeMenu="closeMenu"
        :isOpen="isOpen"
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
    disabled: { type: Boolean, default: false },
    offset: { type: [String, Number], default: '16' }
  },
  data() {
    return {
      isPopoverOpen: false
    }
  },
  computed: {
    isOpen() {
      return this.isPopoverOpen
    }
  },
  watch: {
    isPopoverOpen: {
      immediate: true,
      handler(isOpen) {
        console.log('isOpen', isOpen)
        try {
          if (isOpen) {
            this.$nextTick(() => {
              setTimeout(() => {
                document
                  .getElementsByTagName('body')[0]
                  .classList.add('dropdown-open')
              }, 20)
            })
          } else {
            document
              .getElementsByTagName('body')[0]
              .classList.remove('dropdown-open')
          }
        } catch (err) {}
      }
    }
  },
  beforeDestroy() {
    clearTimeout(mouseEnterTimer)
    clearTimeout(mouseLeaveTimer)
  },
  methods: {
    toggleMenu() {
      if (this.disabled) {
        return
      }
      clearTimeout(mouseEnterTimer)
      clearTimeout(mouseLeaveTimer)
      this.isPopoverOpen = !this.isPopoverOpen
    },
    openMenu(useTimeout) {
      if (this.disabled) {
        return
      }
      if (useTimeout) {
        this.popoverMouseEnter()
      } else {
        this.isPopoverOpen = true
      }
    },
    closeMenu(useTimeout) {
      if (this.disabled) {
        return
      }
      if (useTimeout) {
        this.popoveMouseLeave()
      } else {
        this.isPopoverOpen = false
      }
    },
    popoverMouseEnter() {
      if (this.disabled) {
        return
      }
      clearTimeout(mouseEnterTimer)
      clearTimeout(mouseLeaveTimer)
      if (!this.isPopoverOpen) {
        mouseEnterTimer = setTimeout(() => {
          this.isPopoverOpen = true
        }, 500)
      }
    },
    popoveMouseLeave() {
      if (this.disabled) {
        return
      }
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
