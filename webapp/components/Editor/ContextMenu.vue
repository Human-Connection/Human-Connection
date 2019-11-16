<script>
import tippy from 'tippy.js'

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
        lazy: false,
        content,
        placement,
        showOnCreate,
        theme: 'human-connection',
        trigger,
        onCreate(instance) {
          instance.popperInstance.reference = virtualNode
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
  padding: 0;
  font-size: 1rem;
  text-align: inherit;
  color: $color-neutral-100;

  .tippy-backdrop {
    display: none;
  }

  .tippy-roundarrow {
    fill: $color-primary;
  }
  .tippy-popper[x-placement^='top'] & .tippy-arrow {
    border-top-color: $color-primary;
  }
  .tippy-popper[x-placement^='bottom'] & .tippy-arrow {
    border-bottom-color: $color-primary;
  }
  .tippy-popper[x-placement^='left'] & .tippy-arrow {
    border-left-color: $color-primary;
  }
  .tippy-popper[x-placement^='right'] & .tippy-arrow {
    border-right-color: $color-primary;
  }
}
</style>
