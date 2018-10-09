<template>
  <component 
    :is="tag"
    class="ds-container"
    :class="[
      `ds-container-${width}`
  ]">
    <slot />
  </component>
</template>

<script>
/**
 * This component is used as a wrapper for the page's content.
 * @version 1.0.0
 */
export default {
  name: 'DsContainer',
  props: {
    /**
     * The html element name used for the wrapper.
     */
    tag: {
      type: String,
      default: 'div'
    },
    /**
     * The maximum width the container will take.
     * The widths correspond to the different media breakpoints.
     * `x-small, small, medium, large, x-large`
     */
    width: {
      type: String,
      default: 'x-large',
      validator: value => {
        return value.match(/(x-small|small|medium|large|x-large)/)
      }
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
