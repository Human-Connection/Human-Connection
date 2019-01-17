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
    <circle class="ds-spinner-circle" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
  </svg>
</template>

<script>
export default {
  name: 'DsSpinner',
  props: {
    /**
     * The size used for the spinner.
     * @options small|base|large
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
     */
    primary: {
      type: Boolean,
      default: false
    },
    /**
     * Secondary style
     */
    secondary: {
      type: Boolean,
      default: false
    },
    /**
     * Danger style
     */
    danger: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
