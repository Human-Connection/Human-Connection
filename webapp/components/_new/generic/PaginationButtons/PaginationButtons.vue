<template>
  <div class="pagination-buttons">
    <base-button
      @click="$emit('back')"
      :disabled="!hasPrevious"
      icon="arrow-left"
      circle
      data-test="previous-button"
      v-scroll-to="'.main-navigation'"
    />
    <span class="pagination-pageCount"> Seite {{ hasResultPage + 1 }} / {{ Math.round(hasResultCount / 25) + 1}} </span>
   
    <base-button
      @click="$emit('next')"
      :disabled="!hasNext"
      icon="arrow-right"
      circle
      data-test="next-button"
      v-scroll-to="'.main-navigation'"
    />
  </div>
</template>

<script>
export default {
  props: {
    hasNext: {
      type: Boolean,
      default: false,
    },
    hasPrevious: {
      type: Boolean,
      default: false,
    },
    hasResultPage: {
      type: Number,
      default: 0,
    },
    hasResultCount: {
      type: Number,
      default: 0,
    },
  },
}
</script>

<style lang="scss">
.pagination-buttons {
  display: flex;
  justify-content: space-around;
  width: $size-width-paginate;
  margin: $space-x-small auto;
}

.pagination-pageCount {
 
    justify-content: space-around;
  
    margin: 8px auto;
  }
</style>
