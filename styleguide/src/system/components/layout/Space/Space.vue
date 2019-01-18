<template>
  <component
    :is="tag"
    :style="styles"
    class="ds-space"
    :class="[
      centered && 'ds-space-centered'
    ]"
  >
    <slot />
  </component>
</template>

<script>
import { getSpace } from '@@/utils'
import { mediaQuery } from '@@/mixins'

/**
 * Use this component for grouping and separation.
 * @version 1.0.0
 */
export default {
  name: 'DsSpace',
  mixins: [mediaQuery],
  inject: {
    $parentRow: {
      default: null
    }
  },
  props: {
    /**
     * The top margin of this space.
     */
    marginTop: {
      type: [String, Object],
      default: null
    },
    /**
     * The bottom margin of this space.
     */
    marginBottom: {
      type: [String, Object],
      default: 'large'
    },
    /**
     * The bottom and top margin of this space.
     */
    margin: {
      type: [String, Object],
      default: null
    },

    /**
     * Center content vertacally and horizontally
     */
    centered: {
      type: Boolean,
      default: false
    },
    /**
     * The html element name used for this space.
     */
    tag: {
      type: String,
      default: 'div'
    }
  },
  computed: {
    styles() {
      const top = this.margin ? this.margin : this.marginTop
      const bottom = this.margin ? this.margin : this.marginBottom

      const marginTop = this.mediaQuery(top)
      const marginBottom = this.mediaQuery(bottom)
      const marginTopStyle = this.parseMargin('Top')(marginTop)
      const marginBottomStyle = this.parseMargin('Bottom')(marginBottom)
      const centerStyle = this.center
        ? {
            'text-align': 'center',
            flex: 1,
            'align-content': 'center',
            'jusify-content': 'center'
          }
        : {}

      return {
        ...marginTopStyle,
        ...marginBottomStyle,
        ...centerStyle
      }
    }
  },
  methods: {
    parseMargin(direction) {
      return margin => {
        const styles = {}
        if (!margin) {
          return styles
        }
        const realMargin = getSpace(margin)
        if (realMargin !== 0) {
          styles[`margin${direction}`] = `${realMargin}px`
        }
        return styles
      }
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
