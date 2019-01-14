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
     * The item's width
     * @default 1
     */
    width: {
      type: [String, Number, Object],
      default() {
        return this.$parentFlex ? this.$parentFlex.width : 1
      }
    },
    /**
     * The outtermost html tag
     */
    tag: {
      type: String,
      default: 'div'
    },

    /**
     * Center content vertical and horizontal
     */
    centered: {
      type: Boolean,
      default: false
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
      const centerStyle = this.centered
        ? {
            'align-self': 'center',
            'jusify-self': 'center'
          }
        : {}
      return {
        ...widthStyle,
        ...gutterStyle,
        ...centerStyle
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
