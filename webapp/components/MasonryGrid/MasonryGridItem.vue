<template>
  <ds-grid-item :rowSpan="rowSpan">
    <slot></slot>
  </ds-grid-item>
</template>

<script>
export default {
  data() {
    return {
      rowSpan: 10,
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
    const image = this.$el.querySelector('img')
    if (image) {
      image.onload = () => this.calculateItemHeight()
    } else {
      // use timeout to make sure layout is set up before calculation
      setTimeout(() => this.calculateItemHeight(), 0)
    }
  },
}
</script>
