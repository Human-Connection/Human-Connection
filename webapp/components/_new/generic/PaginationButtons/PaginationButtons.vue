<template>
  <div class="pagination-buttons">
    <base-button
      v-show="hasPreviousResult"
      @click="$emit('back')"
      :disabled="!hasPreviousResult"
      icon="arrow-left"
      circle
      data-test="previous-button"
    />

    <span class="pagination-pageCount">
      {{ $t('search.page') }} {{ activePage + 1 }} /
      {{ Math.floor((activeResourceCount - 1) / pageSize) + 1 }}
    </span>

    <base-button
      v-show="hasMoreResults"
      @click="$emit('next')"
      :disabled="!hasMoreResults"
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
      default: 24,
    },
    hasMoreResults: {
      type: Boolean,
      default: false,
    },
    hasPreviousResult: {
      type: Boolean,
    },
    activePage: {
      type: Number,
      default: 0,
    },
    totalResultCount: {
      type: Number,
      default: 0,
    },
    activeResourceCount: {
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
