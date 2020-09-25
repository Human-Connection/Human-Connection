<template>
  <div class="pagination-buttons">
    <base-button
      class="previous-button"
      :disabled="!hasPrevious"
      icon="arrow-left"
      circle
      data-test="previous-button"
      @click="$emit('back')"
    />

    <span v-if="showPageCounter" class="pagination-pageCount" data-test="pagination-pageCount">
      {{ $t('search.page') }} {{ activePage + 1 }} /
      {{ Math.floor((activeResourceCount - 1) / pageSize) + 1 }}
    </span>

    <base-button
      class="next-button"
      :disabled="!hasNext"
      icon="arrow-right"
      circle
      data-test="next-button"
      @click="$emit('next')"
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
    hasNext: {
      type: Boolean,
      default: false,
    },
    hasPrevious: {
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
    showPageCounter: {
      type: Boolean,
      default: false,
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
