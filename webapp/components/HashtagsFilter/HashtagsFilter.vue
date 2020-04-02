<template>
  <base-card class="hashtags-filter">
    <h2>{{ $t('hashtags-filter.hashtag-search', { hashtag }) }}</h2>
    <base-button
      icon="close"
      circle
      :title="this.$t('hashtags-filter.clearSearch')"
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
.hashtags-filter.base-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-x-small $space-base;
}
</style>
