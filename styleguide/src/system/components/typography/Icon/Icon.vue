<template>
  <component
    :is="tag"
    :aria-label="ariaLabel"
    class="ds-icon"
  >
    <component
      v-if="svgComponent"
      :is="svgComponent"
      class="ds-icon-svg"/>
  </component>
</template>

<script>
import icons from '@@/icons'
/**
 * Icons are used to add meaning and improve accessibility.
 * @version 1.0.0
 */
export default {
  name: 'DsIcon',
  props: {
    /**
     * The name of the icon.
     */
    name: {
      type: String,
      required: true
    },
    /**
     * Descriptive text to be read to screenreaders.
     */
    ariaLabel: {
      type: String,
      default: 'icon'
    },
    /**
     * The html element name used for the icon.
     */
    tag: {
      type: String,
      default: 'span'
    }
  },
  computed: {
    svgComponent() {
      return icons[this.name]
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
