<template>
  <base-card class="filter-menu">
    <h2>{{ $t('filter-menu.hashtag-search', { hashtag }) }}</h2>
    <base-button
      icon="close"
      circle
      :title="this.$t('filter-menu.clearSearch')"
      @click="clearSearch"
    />
  </base-card>
</template>

<script>
export default {
  props: {
    hashtag: {
      type: String,
      required: true,
    },
  },
  methods: {
    clearSearch() {
      this.$emit('clearSearch')
    },
  },
}
</script>

<style lang="scss">
.filter-menu.base-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-x-small $space-base;
}
</style>
