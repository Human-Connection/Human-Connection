<template>
  <component 
    :is="tag"
    :style="styles"
    class="ds-flex">
    <slot />
  </component>
</template>

<script>
import { getSpace } from '@@/utils'
import { mediaQuery } from '@@/mixins'

/**
 * Used in combination with the flex item component to create flexible layouts.
 * @version 1.0.0
 */
export default {
  name: 'DsFlex',
  mixins: [mediaQuery],
  provide() {
    return {
      $parentFlex: this
    }
  },
  props: {
    /**
     * The default gutter size for the columns.
     */
    gutter: {
      type: [String, Object],
      default: null
    },
    /**
     * The default width for the columns.
     */
    width: {
      type: [String, Number, Object],
      default: 1
    },
    /**
     * The direction of the items.
     * `row, row-reverse, column, column-reverse`
     */
    direction: {
      type: [String, Object],
      default: null
    },
    /**
     * The html element name used for the wrapper.
     */
    tag: {
      type: String,
      default: 'div'
    }
  },
  computed: {
    styles() {
      const gutter = this.mediaQuery(this.gutter)
      const direction = this.mediaQuery(this.direction)
      const gutterStyle = gutter ? this.parseGutter(gutter) : {}
      const directionStyle = direction ? this.parseDirection(direction) : {}
      return {
        ...gutterStyle,
        ...directionStyle
      }
    }
  },
  methods: {
    parseGutter(gutter) {
      const realGutter = getSpace(gutter)
      return {
        marginLeft: `-${realGutter / 2}px`,
        marginRight: `-${realGutter / 2}px`
      }
    },
    parseDirection(direction) {
      return {
        flexDirection: direction
      }
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
