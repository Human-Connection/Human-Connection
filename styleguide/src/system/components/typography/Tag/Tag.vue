<template>
  <component 
    :is="tag"
    class="ds-tag"
    :class="[
      `ds-tag-size-${size}`,
      `ds-tag-${color}`,
      round && 'ds-tag-round'
    ]"
  >
    <slot />
  </component>
</template>

<script>
/**
 * Tags are used for styling and highlighting small pieces of information.
 * Most of the time they are used for keywords or numbers.
 * @version 1.0.0
 */
export default {
  name: 'DsTag',
  props: {
    /**
     * The background color used for the tag.
     * `medium, inverse, primary, success, warning, danger`
     */
    color: {
      type: String,
      default: 'medium',
      validator: value => {
        return value.match(/(medium|inverse|primary|success|warning|danger)/)
      }
    },
    /**
     * The size used for the text.
     * `base, large, small`
     */
    size: {
      type: String,
      default: 'base',
      validator: value => {
        return value.match(/(base|large|small)/)
      }
    },
    /**
     * Whether the tag should be round
     * `true, false`
     */
    round: {
      type: Boolean,
      default: false
    },
    /**
     * The html element name used for the text.
     */
    tag: {
      type: String,
      default: 'span'
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
