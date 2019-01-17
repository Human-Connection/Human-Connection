<template>
  <component
    :is="tag"
    class="ds-logo"
    :class="[
      inverse && `ds-logo-inverse`
  ]">
    <svg-logo
      v-if="!inverse"
      class="ds-logo-svg" />
    <svg-logo-inverse
      v-else
      class="ds-logo-svg" />
  </component>
</template>

<script>
import svgLogo from '@@/assets/img/Logo-Horizontal.svg'
import svgLogoInverse from '@@/assets/img/Logo-Horizontal-Dark.svg'
/**
 * This component displays the brand's logo.
 * @version 1.0.0
 */
export default {
  name: 'DsLogo',
  components: {
    svgLogo,
    svgLogoInverse
  },
  props: {
    /**
     * Inverse the logo
     */
    inverse: {
      type: Boolean,
      default: false
    },
    /**
     * The html element name used for the logo.
     */
    tag: {
      type: String,
      default: 'div'
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
