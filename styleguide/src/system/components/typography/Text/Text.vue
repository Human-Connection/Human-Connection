<template>
  <component
    :is="tag"
    class="ds-text"
    :class="[
      size && `ds-text-size-${size}`,
      color && `ds-text-${color}`,
      bold && `ds-text-bold`,
      align && `ds-text-${align}`,
      uppercase && `ds-text-uppercase`
    ]"
  >
    <slot />
  </component>
</template>

<script>
/**
 * Text is used for styling and grouping paragraphs or words.
 * Defaults to a `p` tag. If nested inside of another text
 * component it defaults to a `span` tag.
 * @version 1.0.0
 */
export default {
  name: 'DsText',
  provide() {
    return {
      $parentText: this
    }
  },
  inject: {
    $parentText: {
      default: null
    }
  },
  props: {
    /**
     * The color used for the text.
     * `default, soft, softer, primary, inverse, success, warning, danger`
     */
    color: {
      type: String,
      default: null,
      validator: value => {
        return value.match(
          /(default|soft|softer|primary|inverse|success|warning|danger)/
        )
      }
    },
    /**
     * Whether the text is bold.
     */
    bold: {
      type: Boolean,
      default: null
    },
    /**
     * The size used for the text.
     * `small, base, large, x-large`
     */
    size: {
      type: String,
      default: null,
      validator: value => {
        return value.match(/(small|base|large|x-large|xx-large|xxx-large)/)
      }
    },
    /**
     * The html element name used for the text.
     */
    tag: {
      type: String,
      default() {
        return this.$parentText ? 'span' : 'p'
      }
    },
    /**
     * Align Text
     * `left, center, right
     */
    align: {
      type: String,
      default: null,
      validator: value => {
        return value.match(/(left|center|right)/)
      }
    },
    /**
     * Text in Uppdercase
     */
    uppercase: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
