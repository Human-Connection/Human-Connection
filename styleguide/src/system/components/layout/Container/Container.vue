<template>
  <component 
    :is="tag"
    class="ds-container"
    :class="[
      `ds-container-${width}`,
      centered && `ds-container-centered`,
    ]"
  >
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
     * The outtermost html tag
     */
    tag: {
      type: String,
      default: 'div'
    },
    /**
     * The maximum width the container will take.
     * The widths correspond to the different media breakpoints.
     * @options x-small|small|medium|large|x-large
     */
    width: {
      type: String,
      default: 'x-large',
      validator: value => {
        return value.match(/(x-small|small|medium|large|x-large)/)
      }
    },
    /**
     * Center the content
     */
    centered: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
