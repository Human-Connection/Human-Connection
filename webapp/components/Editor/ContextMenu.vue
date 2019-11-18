<script>
import tippy, { roundArrow } from 'tippy.js'

import 'tippy.js/dist/svg-arrow.css'

export default {
  props: {
    content: Object,
  },
  methods: {
    displayContextMenu(decorationNode, virtualNode, content, type) {
      const placement = type === 'link' ? 'right' : 'top-start'
      const trigger = type === 'link' ? 'click' : 'mouseenter'
      const showOnCreate = type !== 'link'

      if (this.menu) {
        return
      }

      this.menu = tippy(decorationNode, {
        arrow: roundArrow,
        lazy: false,
        content,
        placement,
        showOnCreate,
        theme: 'human-connection',
        trigger,
        onCreate(instance) {
          instance.popperInstance.reference = {
            ...virtualNode,
            popperOptions: { positionFixed: true },
          }
        },
        onMount(instance) {
          const input = instance.popper.querySelector('input')
          if (input) {
            input.focus({ preventScroll: true })
          }
        },
      })
    },
    hideContextMenu() {
      if (this.menu) {
        this.menu.destroy()
        this.menu = null
      }
    },
  },
  render() {
    return null
  },
}
</script>

<style lang="scss">
.tippy-tooltip.human-connection-theme {
  background-color: $color-primary;
  font-size: 1rem;
  text-align: inherit;
  color: $color-neutral-100;

  .tippy-backdrop {
    display: none;
  }

  .tippy-svg-arrow {
    fill: $color-primary;
    top: $border-radius-x-large;
  }
  .tippy-popper[data-placement^='top'] & .tippy-arrow {
    border-top-color: $color-primary;
  }
  .tippy-popper[data-placement^='bottom'] & .tippy-arrow {
    border-bottom-color: $color-primary;
  }
  .tippy-popper[data-placement^='left'] & .tippy-arrow {
    border-left-color: $color-primary;
  }
  .tippy-popper[data-placement^='right'] & .tippy-arrow {
    border-right-color: $color-primary;
  }
}
</style>
