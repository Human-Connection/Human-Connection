<template>
  <ds-card>
    <ds-flex>
      <ds-flex-item class="filter-menu-title">
        <ds-heading size="h3">
          {{ $t('filter-menu.title') }}
        </ds-heading>
      </ds-flex-item>
      <ds-flex-item>
        <div class="filter-menu-buttons">
        <ds-button
          name="filter-by-followed-authors-only"
          icon="user-plus"
          :primary="onlyFollowed"
          @click="toggleOnlyFollowed"
          />
        </div>
      </ds-flex-item>
    </ds-flex>
  </ds-card>
</template>

<script>
export default {
  data() {
    // We have to fix styleguide here. It uses .includes wich will always be
    // false for arrays of objects.
    return {
      filterBubble: {
        author: 'all',
      },
    }
  },
  computed: {
    onlyFollowed() {
      return this.filterBubble.author === 'followed'
    },
  },
  methods: {
    toggleOnlyFollowed() {
      this.filterBubble.author = this.onlyFollowed ? 'all' : 'followed'
      this.$emit('changeFilterBubble', this.filterBubble)
    },
  },
}
</script>

<style lang="scss">
.filter-menu-title {
  display: flex;
  align-items: center;
}

.filter-menu-buttons {
  float: right;
}
</style>
