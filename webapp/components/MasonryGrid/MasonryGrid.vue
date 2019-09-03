<template>
  <ds-grid
    :min-column-width="300"
    v-on:calculating-item-height="startCalculation"
    v-on:finished-calculating-item-height="endCalculation"
    :class="[itemsCalculating ? 'reset-grid-height' : '']"
  >
    <slot></slot>
  </ds-grid>
</template>

<script>
export default {
  data() {
    return {
      itemsCalculating: 0,
    }
  },
  methods: {
    startCalculation() {
      this.itemsCalculating += 1
    },
    endCalculation() {
      this.itemsCalculating -= 1
    },
  },
}
</script>

<style>
.reset-grid-height {
  grid-auto-rows: auto !important;
  align-items: self-start;
}
</style>
