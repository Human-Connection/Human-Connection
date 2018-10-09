<template>
  <component
    :is="tag"
    class="ds-heading"
    :class="[
      `ds-heading-${size || tag}`,
      primary && `ds-heading-primary`,
      soft && `ds-heading-soft`
    ]"
  >
    <slot />
  </component>
</template>

<script>
/**
 * Headings are used as the titles of each major
 * section of a page in the interface.
 *
 * @version 1.0.0
 */
export default {
  name: 'DsHeading',
  props: {
    /**
     * The heading type used for the heading.
     * `h1, h2, h3, h4, h5, h6`
     */
    tag: {
      type: String,
      default: 'h1',
      validator: value => {
        return value.match(/(h1|h2|h3|h4|h5|h6)/)
      }
    },
    /**
     * The size used for the heading.
     * `h1, h2, h3, h4, h5, h6`
     */
    size: {
      type: String,
      default: null,
      validator: value => {
        return value.match(/(h1|h2|h3|h4|h5|h6)/)
      }
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
     * Muted style
     * `true, false`
     */
    soft: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
