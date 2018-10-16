<template>
  <div
    class="ds-avatar"
    :style="styles">
    <img
      v-if="!error"
      :src="image"
      @error="onError">
    <ds-flex
      v-if="!hasImage || error"
      style="height: 100%">
      <ds-flex-item center>
        <template v-if="isAnonymus">
          <ds-icon name="eye-slash" />
        </template>
        <template v-else>
          {{ userInitials }}
        </template>
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
import helpers from './lib/helpers.js'

export default {
  name: 'DsAvatar',
  props: {
    backgroundColor: { type: String, default: null },
    name: { type: String, default: 'Anonymus' },
    size: { type: [Number, String], default: '32px' },
    image: { type: String, default: null }
  },
  data() {
    return {
      error: false
    }
  },
  computed: {
    isAnonymus() {
      return !this.name || this.name.toLowerCase() === 'anonymus'
    },
    styles() {
      let size = this.size
      if (Number.isInteger(Number(size))) {
        size = `${size}px`
      }
      const nummericSize = Number.parseInt(size)
      return {
        width: size,
        height: size,
        backgroundColor: this.hasImage ? 'white' : this.background,
        fontSize: Math.floor(nummericSize / 2.5) + 'px',
        fontWeight: 'bold',
        color: this.fontColor
      }
    },
    hasImage() {
      return Boolean(this.image) && !this.error
    },
    userInitials() {
      return helpers.initials(this.name)
    },
    background() {
      return (
        this.backgroundColor ||
        helpers.randomBackgroundColor(
          this.name.length,
          helpers.backgroundColors
        )
      )
    },
    fontColor() {
      return this.color || helpers.lightenColor(this.background, 200)
    }
  },
  methods: {
    onError() {
      this.error = true
    },
    updateSize() {
      if (this.hasImage) {
        return
      }
      try {
        this.size = this.$refs.avatar.getBoundingClientRect().width
      } catch (err) {
        // nothing
      }
    }
  }
}
</script>


<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
