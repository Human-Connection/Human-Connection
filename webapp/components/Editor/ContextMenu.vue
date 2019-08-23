<script>
import tippy from 'tippy.js'

export default {
  props: {
    content: Object,
    node: Object,
  },
  methods: {
    displayContextMenu(target, content) {
      if (this.menu) {
        return
      }
      this.menu = tippy(target, {
        content: content,
        trigger: 'mouseenter',
        interactive: true,
        theme: 'dark',
        placement: 'top-start',
        inertia: true,
        duration: [400, 200],
        showOnInit: true,
        arrow: true,
        arrowType: 'round',
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
