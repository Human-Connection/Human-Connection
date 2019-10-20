<template>
  <ds-card class="filter-menu-card">
    <ds-flex class="filter-menu-content">
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

.filter-menu-content {
  height: 100%;
  align-items: center;
}

.filter-menu-title {
  display: flex;
  align-items: center;
}

.filter-menu-buttons {
  float: right;
}
</style>
