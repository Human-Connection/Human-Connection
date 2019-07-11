<template>
  <ds-container>
    <ds-space />
    <ds-flex>
      <ds-flex-item
        :width="{ base: '100%', sm: '100%', md: '100%', lg: '13%' }"
        class="categories-list"
      >
        <ds-space margin-bottom="x-small" />
        <ds-flex id="filter-posts-header">
          <ds-heading tag="h4">{{ $t('filter-posts.header') }}</ds-heading>
          <ds-flex-item width="10%" />
          <ds-flex-item width="100%">
            <ds-button
              icon="check"
              @click.stop.prevent="toggleCategory()"
              :primary="allCategories"
            />
            <ds-flex-item>
              <label>{{ $t('filter-posts.all') }}</label>
            </ds-flex-item>
            <ds-space />
          </ds-flex-item>
        </ds-flex>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '0%', sm: '0%', md: '0%', lg: '7%' }" />
      <ds-flex-item
        :width="{ base: '50%', sm: '0%', md: '50%', lg: '10%' }"
        v-for="index in chunk.length"
        :key="index"
      >
        <ds-flex v-for="category in chunk[index - 1]" :key="category.id" class="categories-list">
          <ds-flex>
            <ds-flex-item width="100%">
              <ds-button
                :icon="category.icon"
                :primary="isActive(category.id)"
                @click.stop.prevent="toggleCategory(category.id)"
              />
              <ds-space margin-bottom="small" />
            </ds-flex-item>
            <ds-flex>
              <ds-flex-item>
                <label>{{ category.name }}</label>
              </ds-flex-item>
              <ds-space margin-bottom="xx-large" />
            </ds-flex>
          </ds-flex>
        </ds-flex>
      </ds-flex-item>
    </ds-flex>
  </ds-container>
</template>
<script>
export default {
  props: {
    chunk: { type: Array, default: () => [] },
  },
  data() {
    return {
      selectedCategoryIds: [],
      allCategories: true,
    }
  },
  methods: {
    isActive(id) {
      const index = this.selectedCategoryIds.indexOf(id)
      if (index > -1) {
        return true
      }
      return false
    },
    toggleCategory(id) {
      const index = this.selectedCategoryIds.indexOf(id)
      if (index > -1) {
        this.selectedCategoryIds.splice(index, 1)
      } else {
        this.selectedCategoryIds.push(id)
      }
      if (!id) this.selectedCategoryIds = []
      this.selectedCategoryIds.length ? (this.allCategories = false) : (this.allCategories = true)
      this.$emit('filterPosts', this.selectedCategoryIds)
    },
  },
}
</script>
