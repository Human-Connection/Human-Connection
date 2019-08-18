<template>
  <ds-grid
    :min-column-width="300"
    v-on:grid-item-mounted="calculateItemHeight"
    class="reset-grid-height"
  >
    <slot :rowSpan="rowSpan">Loading...</slot>
  </ds-grid>
</template>

<script>
export default {
  data() {
    return {
      rowSpan: 10,
      rowHeight: null,
    }
  },
  methods: {
    calculateItemHeight(gridItem) {
      const grid = this.$el
      const rowHeight = this.rowHeight
      const rowGap = parseInt(grid.style.gridRowGap)

      const itemHeight = gridItem.$el.clientHeight
      const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap))
      gridItem.rowSpan = rowSpan
    },
  },
  mounted() {
    this.rowHeight = parseInt(this.$el.style.gridAutoRows)
    this.$el.classList.remove('reset-grid-height')
  },
}
</script>

<style>
.reset-grid-height {
  grid-auto-rows: auto !important;
  align-items: self-start;
}
</style>
