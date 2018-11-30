<template>
  <component
    :is="tag"
    :aria-label="ariaLabel"
    class="ds-icon"
    :class="[size && `ds-icon-size-${size}`]"
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
    },
    /**
     * Which size should the icon have?
     * `xx-small, x-small, small, base, large, x-large, xx-large, xxx-large`
     */
    size: {
      type: String,
      default: null,
      validator: value => {
        return value.match(
          /(xx-small|x-small|small|base|large|x-large|xx-large|xxx-large)/
        )
      }
    }
  },
  computed: {
    svgComponent() {
      const icon = icons[this.name]
      if (!icon) {
        return false
      }
      return icon.render ? icon : icon.default
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
