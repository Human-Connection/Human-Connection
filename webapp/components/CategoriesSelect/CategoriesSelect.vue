<template>
  <section class="categories-select">
    <base-button
      v-for="category in categories"
      :key="category.id"
      :data-test="categoryButtonsId(category.id)"
      @click="toggleCategory(category.id)"
      :filled="isActive(category.id)"
      :disabled="isDisabled(category.id)"
      :icon="category.icon"
      size="small"
    >
      {{ $t(`contribution.category.name.${category.slug}`) }}
    </base-button>
  </section>
</template>

<script>
import CategoryQuery from '~/graphql/CategoryQuery'
import xor from 'lodash/xor'

export default {
  inject: {
    $parentForm: {
      default: null,
    },
  },
  props: {
    existingCategoryIds: { type: Array, default: () => [] },
    model: { type: String, required: true },
  },
  data() {
    return {
      categories: null,
      selectedMax: 3,
      selectedCategoryIds: this.existingCategoryIds,
    }
  },
  computed: {
    selectedCount() {
      return this.selectedCategoryIds.length
    },
    reachedMaximum() {
      return this.selectedCount >= this.selectedMax
    },
  },
  methods: {
    toggleCategory(id) {
      this.selectedCategoryIds = xor(this.selectedCategoryIds, [id])
      if (this.$parentForm) {
        this.$parentForm.update(this.model, this.selectedCategoryIds)
      }
    },
    isActive(id) {
      return this.selectedCategoryIds.includes(id)
    },
    isDisabled(id) {
      return !!(this.reachedMaximum && !this.isActive(id))
    },
    categoryButtonsId(categoryId) {
      return `category-buttons-${categoryId}`
    },
  },
  apollo: {
    Category: {
      query() {
        return CategoryQuery()
      },
      result({ data: { Category } }) {
        this.categories = Category
      },
    },
  },
}
</script>

<style lang="scss">
.categories-select {
  display: flex;
  flex-wrap: wrap;

  > .base-button {
    margin-right: $space-xx-small;
    margin-bottom: $space-xx-small;
  }
}
</style>
