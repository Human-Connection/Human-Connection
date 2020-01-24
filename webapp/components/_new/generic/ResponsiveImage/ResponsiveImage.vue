<template>
  <img :data-src="lazySrc" :data-srcset="lazySrcset" :style="style" class="responsive-image lozad" />
</template>

<script>
import lozad from 'lozad'

export default {
  name: 'ResponsiveImage',
  props: {
    backgroundColor: {
      type: String,
      default: '#efefef',
    },
    height: {
      type: Number,
      default: null,
    },
    lazySrc: {
      type: String,
      default: null,
    },
    lazySrcset: {
      type: String,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    aspectRatio() {
      if (!this.width || !this.height) return null
      return (this.height / this.width) * 100
    },
    style() {
      const style = { backgroundColor: this.backgroundColor }
      if (this.width) style.width = `${this.width}px`
      const applyAspectRatio = this.loading && this.aspectRatio
      if (applyAspectRatio) {
        style.height = 0
        style.paddingTop = `${this.aspectRatio}%`
      }

      return style
    },
  },
  mounted() {
    // As soon as the <img> element triggers
    // the `load` event, the loading state is
    // set to `false`, which removes the apsect
    // ratio we've applied earlier.
    const setLoadingState = () => {
      this.loading = false
    }
    this.$el.addEventListener('load', setLoadingState)
    // We remove the event listener as soon as
    // the component is destroyed to prevent
    // potential memory leaks.
    this.$once('hook:destroyed', () => {
      this.$el.removeEventListener('load', setLoadingState)
    })

    // We initialize Lozad.js on the root
    // element of our component.
    const observer = lozad(this.$el)
    observer.observe()
  },
}
</script>

<style lang="scss">
// Responsive image styles.
.responsive-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  vertical-align: middle;
}
</style>
