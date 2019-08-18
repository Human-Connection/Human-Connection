<template>
  <ds-grid-item :rowSpan="rowSpan">
    <slot></slot>
  </ds-grid-item>
</template>

<script>
export default {
  data() {
    return {
      span: 10,
    }
  },
  computed: {
    rowSpan: {
      get() {
        return this.span
      },
      set(rowSpan) {
        this.span = rowSpan
      },
    },
  },
  mounted() {
    this.$parent.$emit('grid-item-mounted', this)
  },
}
</script>
