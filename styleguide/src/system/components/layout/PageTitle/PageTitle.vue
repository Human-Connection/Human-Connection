<template>
  <component 
    :is="tag"
    class="ds-page-title"
    :class="[
      highlight && `ds-page-title-highlight`
    ]"
  >
    <ds-container>
      <ds-heading>
        {{ heading }}
      </ds-heading>
      <slot />
    </ds-container>
  </component>
</template>

<script>
/**
 * This component is used as the title of a page.
 * @version 1.0.0
 */
export default {
  name: 'DsPageTitle',
  props: {
    /**
     * The heading of the page.
     */
    heading: {
      type: String,
      default: '',
      required: true
    },
    /**
     * Whether this title should be highlighted
     * `true, false`
     */
    highlight: {
      type: Boolean,
      default: false
    },
    /**
     * The html element name used for the title.
     */
    tag: {
      type: String,
      default: 'header'
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
