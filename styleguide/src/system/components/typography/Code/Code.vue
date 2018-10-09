<template>
  <component
    class="ds-code"
    :is="inline ? 'code' : 'pre'"
    :class="[
      size && `ds-code-size-${size}`,
      inline && `ds-code-inline`
    ]"
  >
    <slot />
  </component>
</template>

<script>
/**
 * The code component is used for displaying lines of code.
 * @version 1.0.0
 */
export default {
  name: 'DsCode',
  props: {
    /**
     * Display the code inline.
     * `true, false`
     */
    inline: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
