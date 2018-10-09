<template>
  <component 
    :is="tag"
    class="ds-placeholder">
    <div class="ds-placeholder-content">
      <slot />
    </div>
  </component>
</template>

<script>
/**
 * This component is used as a placeholder for other content.
 * @version 1.0.0
 */
export default {
  name: 'DsPlaceholder',
  props: {
    /**
     * The html element name used for the placeholder.
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
