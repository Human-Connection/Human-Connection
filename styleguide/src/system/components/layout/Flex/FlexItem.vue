<template>
  <component 
    :is="tag"
    :style="styles"
    class="ds-flex-item">
    <slot />
  </component>
</template>

<script>
import { getSpace } from '@@/utils'
import { mediaQuery } from '@@/mixins'

/**
 * @version 1.0.0
 * @see DsFlex
 */
export default {
  name: 'DsFlexItem',
  mixins: [mediaQuery],
  inject: {
    $parentFlex: {
      default: null
    }
  },
  props: {
    /**
     * The width of the item.
     */
    width: {
      type: [String, Number, Object],
      default() {
        return this.$parentFlex ? this.$parentFlex.width : 1
      }
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
    gutter() {
      return this.$parentFlex ? this.$parentFlex.gutter : 0
    },
    styles() {
      const width = this.mediaQuery(this.width)
      const gutter = this.mediaQuery(this.gutter)
      const widthStyle = this.parseWidth(width)
      const gutterStyle = this.parseGutter(gutter)
      return {
        ...widthStyle,
        ...gutterStyle
      }
    }
  },
  methods: {
    parseWidth(width) {
      const styles = {}
      if (isNaN(width)) {
        styles.flexBasis = width
        styles.width = width
      } else {
        styles.flexGrow = width
        styles.flexShrink = 0
        styles.flexBasis = 0
      }
      return styles
    },
    parseGutter(gutter) {
      const realGutter = getSpace(gutter)
      if (realGutter === 0) {
        return {}
      }
      return {
        paddingLeft: `${realGutter / 2}px`,
        paddingRight: `${realGutter / 2}px`,
        marginBottom: `${realGutter}px`
      }
    }
  }
}
</script>
