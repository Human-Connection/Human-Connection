<template>
  <ds-grid-item :rowSpan="rowSpan">
    <slot></slot>
  </ds-grid-item>
</template>

<script>
const landscapeRatio = 1.3
const squareRatio = 1
const portraitRatio = 0.7
const getRowSpan = (aspectRatio) => {
  if (aspectRatio >= landscapeRatio) return 13
  else if (aspectRatio >= squareRatio) return 15
  else if (aspectRatio >= portraitRatio) return 18
  else return 25
}

export default {
  props: {
    imageAspectRatio: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      rowSpan: this.imageAspectRatio ? getRowSpan(this.imageAspectRatio) : 8,
    }
  },
  methods: {
    calculateItemHeight() {
      this.$parent.$emit('calculating-item-height')

      this.$nextTick(() => {
        const gridStyle = this.$parent.$el.style
        const rowHeight = parseInt(gridStyle.gridAutoRows)
        const rowGapValue = gridStyle.rowGap || gridStyle.gridRowGap
        const rowGap = parseInt(rowGapValue)
        const itemHeight = this.$el.clientHeight

        this.rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap))
        this.$parent.$emit('finished-calculating-item-height')
      })
    },
  },
  mounted() {
    this.calculateItemHeight()
  },
}
</script>
