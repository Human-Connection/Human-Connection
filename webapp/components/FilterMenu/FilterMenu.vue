<template>
  <ds-card>
    <ds-button
      name="filter-by-followed-authors-only"
      icon="plus"
      :primary="onlyFollowed"
      @click="toggleOnlyFollowed"
    />
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
