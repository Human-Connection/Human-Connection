<template>
  <svg 
    viewBox="0 0 50 50"
    class="ds-spinner"
    :class="[
      `ds-size-${this.size}`,
      inverse && 'ds-spinner-inverse',
      primary && !inverse && `ds-spinner-primary`,
      secondary && !inverse && `ds-spinner-secondary`,
      danger && !inverse && `ds-spinner-danger`,
    ]"
  >
    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
  </svg>
</template>

<script>
export default {
  name: 'DsSpinner',
  props: {
    /**
     * The size used for the spinner.
     * `small, base, large`
     */
    size: {
      type: String,
      default: 'base',
      validator: value => {
        return value.match(/(small|base|large)/)
      }
    },
    /**
     * Set to true, if you use it on dark background
     */
    inverse: {
      type: Boolean,
      default: false
    },
    /**
     * Primary style
     * `true, false`
     */
    primary: {
      type: Boolean,
      default: false
    },
    /**
     * Secondary style
     * `true, false`
     */
    secondary: {
      type: Boolean,
      default: false
    },
    /**
     * Danger style
     * `true, false`
     */
    danger: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<docs src="./demo.md"></docs>

<style lang="scss" src="./style.scss">
</style>