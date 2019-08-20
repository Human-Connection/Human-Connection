<template>
  <ds-card v-show="hashtag" class="filter-menu-card">
    <div>
      <ds-space margin-bottom="x-small" />
      <ds-flex>
        <ds-flex-item>
          <ds-heading size="h3">{{ $t('filter-menu.hashtag-search', { hashtag }) }}</ds-heading>
        </ds-flex-item>
        <ds-flex-item>
          <div class="filter-menu-buttons">
            <ds-button
              v-tooltip="{
                content: this.$t('filter-menu.clearSearch'),
                placement: 'left',
                delay: { show: 500 },
              }"
              name="clear-search-button"
              icon="close"
              @click="clearSearch"
            />
          </div>
        </ds-flex-item>
      </ds-flex>
    </div>
  </ds-card>
</template>

<script>
export default {
  props: {
    hashtag: { type: String, default: null },
  },
  methods: {
    clearSearch() {
      this.$emit('clearSearch')
    },
  },
}
</script>

<style lang="scss">
.filter-menu-card {
  background-color: $background-color-soft;
}

.filter-menu-title {
  display: flex;
  align-items: center;
}

.filter-menu-buttons {
  float: right;
}
</style>
