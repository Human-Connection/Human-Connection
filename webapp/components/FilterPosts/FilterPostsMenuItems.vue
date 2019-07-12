<template>
  <ds-container>
    <ds-space />
    <ds-flex id="filter-posts-header">
      <ds-heading tag="h4">{{ $t('filter-posts.header') }}</ds-heading>
      <ds-space margin-bottom="large" />
    </ds-flex>
    <ds-flex>
      <ds-flex-item
        :width="{ base: '100%', sm: '100%', md: '100%', lg: '5%' }"
        class="categories-menu-item"
      >
        <ds-space margin-bottom="x-small" />
        <ds-flex>
          <ds-flex-item width="10%" />
          <ds-flex-item width="100%">
            <ds-button
              icon="check"
              @click.stop.prevent="toggleCategory()"
              :primary="allCategories"
            />
            <ds-flex-item>
              <label class="category-labels">{{ $t('filter-posts.all') }}</label>
            </ds-flex-item>
            <ds-space />
          </ds-flex-item>
        </ds-flex>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '0%', sm: '0%', md: '0%', lg: '7%' }" />
      <ds-flex-item
        :width="{ base: '50%', sm: '50%', md: '50%', lg: '11%' }"
        v-for="index in chunk.length"
        :key="index"
      >
        <ds-flex v-for="category in chunk[index - 1]" :key="category.id" class="categories-menu">
          <ds-flex class="categories-menu">
            <ds-flex-item width="100%" class="categories-menu-item">
              <ds-button
                :icon="category.icon"
                :primary="isActive(category.id)"
                @click.stop.prevent="toggleCategory(category.id)"
              />
              <ds-space margin-bottom="small" />
            </ds-flex-item>
            <ds-flex>
              <ds-flex-item class="categories-menu-item">
                <label class="category-labels">{{ category.name }}</label>
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
      if (!id) {
        this.selectedCategoryIds = []
        this.allCategories = true
      } else {
        const index = this.selectedCategoryIds.indexOf(id)
        if (index > -1) {
          this.selectedCategoryIds.splice(index, 1)
        } else {
          this.selectedCategoryIds.push(id)
        }
        this.allCategories = false
      }
      this.$emit('filterPosts', this.selectedCategoryIds)
    },
  },
}
</script>
<style lang="scss">
#filter-posts-header {
  display: block;
  text-align: center;
}
.categories-menu-item {
  text-align: center;
}
.categories-menu {
  justify-content: center;
}

.category-labels {
  font-size: $font-size-small;
}
</style>
