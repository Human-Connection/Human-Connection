<template>
  <component 
    :is="tag"
    class="ds-chip"
    :class="[
      `ds-chip-size-${size}`,
      `ds-chip-${color}`,
      removable && 'ds-chip-removable',
      round && 'ds-chip-round'
    ]"
  >
    <slot />
    <button
      v-if="removable"
      @click="remove"
      class="ds-chip-close"
      tabindex="-1">
      <ds-icon name="close" />
    </button>
  </component>
</template>

<script>
/**
 * Chips are used to represent small blocks of information.
 * Their most common usage is for displaying contacts or tags.
 * @version 1.0.0
 */
export default {
  name: 'DsChip',
  props: {
    /**
     * The background color used for the chip.
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
     * Whether the chip should be removeable
     * `true, false`
     */
    removable: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the chip should be rounded
     * `true, false`
     */
    round: {
      type: Boolean,
      default: true
    },
    /**
     * The html element name used for the text.
     */
    tag: {
      type: String,
      default: 'span'
    }
  },
  methods: {
    remove() {
      /**
       * Fires after user clicked the remove button.
       *
       * @event remove
       */
      this.$emit('remove')
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
