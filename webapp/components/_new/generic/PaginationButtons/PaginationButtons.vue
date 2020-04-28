<template>
  <div class="pagination-buttons">
    <base-button
      @click="$emit('back')"
      :disabled="!hasPrevious"
      icon="arrow-left"
      circle
      data-test="previous-button"
    />
    <span class="pagination-pageCount">
      {{ totalResultCount }} - {{  pageSize }} - {{activePage}} - {{ Math.round(totalResultCount )  }}
      Seite {{ activePage + 1 }} / {{ Math.round(totalResultCount / pageSize) + 1 }}
    </span>

    <base-button
      @click="$emit('next')"
      :disabled="!hasNext"
      icon="arrow-right"
      circle
      data-test="next-button"
      v-scroll-to="'#search-results'"
    />
  </div>
</template>

<script>
export default {
  props: {
    pageSize: {
      type: Number,
      default: 24
    },
    hasNext: {
      type: Boolean,
      default: false,
    },
    hasPrevious: {
      type: Boolean,
      default: false,
    },
    activePage: {
      type: Number,
      default: 0,
    },
    totalResultCount: {
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
