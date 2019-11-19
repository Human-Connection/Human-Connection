<script>
import tippy, { roundArrow } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
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
        duration: [400, 200],
        inertia: true,
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

  .tippy-content {
    padding: 0;
  }

  .tippy-svg-arrow {
    fill: $color-primary;
  }
}
</style>
