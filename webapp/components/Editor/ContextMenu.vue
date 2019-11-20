<script>
import tippy from 'tippy.js'

export default {
  props: {
    content: Object,
    node: Object,
  },
  methods: {
    displayContextMenu(target, content, type) {
      const placement = type === 'link' ? 'right' : 'top-start'
      const trigger = type === 'link' ? 'click' : 'mouseenter'
      const showOnInit = type !== 'link'

      if (this.menu) {
        return
      }

      this.menu = tippy(target, {
        arrow: true,
        arrowType: 'round',
        content: content,
        duration: [400, 200],
        inertia: true,
<<<<<<< Updated upstream
        interactive: true,
=======
        // interactive: true,
>>>>>>> Stashed changes
        placement,
        showOnInit,
        theme: 'human-connection',
        trigger,
<<<<<<< Updated upstream
=======
        onCreate(instance) {
          instance.popperInstance.reference = {
            ...virtualNode,
            // popperOptions: { positionFixed: true },
          }
        },
>>>>>>> Stashed changes
        onMount(instance) {
          const input = instance.popper.querySelector('input')

          if (input) {
            input.focus({ preventScroll: true })
          }
        },
      })

      // we have to update tippy whenever the DOM is updated
      if (MutationObserver) {
        this.observer = new MutationObserver(() => {
          this.menu.popperInstance.scheduleUpdate()
        })
        this.observer.observe(content, {
          childList: true,
          subtree: true,
          characterData: true,
        })
      }
    },
    hideContextMenu() {
      if (this.menu) {
        this.menu.destroy()
        this.menu = null
      }
      if (this.observer) {
        this.observer.disconnect()
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
<<<<<<< Updated upstream
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
=======
  // .tippy-popper {
  //   pointer-events: auto;
  // }
>>>>>>> Stashed changes
}
</style>
