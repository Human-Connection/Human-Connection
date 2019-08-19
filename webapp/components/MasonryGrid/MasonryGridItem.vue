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
      const grid = this.$parent.$emit('calculating-item-height')
      this.$nextTick(() => {
        const rowHeight = parseInt(grid.$el.style.gridAutoRows)
        const rowGap = parseInt(grid.$el.style.gridRowGap)

        const itemHeight = this.$el.clientHeight
        const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap))
        this.rowSpan = rowSpan
        this.$parent.$emit('finished-calculating-item-height')
      })
    },
  },
  mounted() {
    const image = this.$el.querySelector('img')
    if (image) {
      image.onload = () => this.calculateItemHeight()
    } else {
      setTimeout(() => this.calculateItemHeight(), 0)
    }
  },
}
</script>
