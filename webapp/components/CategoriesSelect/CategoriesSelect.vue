<template>
  <div>
    <ds-flex :gutter="{ base: 'xx-small', md: 'small', lg: 'xx-small' }">
      <div v-for="category in categories" :key="category.id">
        <ds-flex-item>
          <ds-button
            size="small"
            :data-test="categoryButtonsId(category.id)"
            @click.prevent="toggleCategory(category.id)"
            :primary="isActive(category.id)"
            :disabled="isDisabled(category.id)"
          >
            <ds-icon :name="category.icon" />
            {{ $t(`contribution.category.name.${category.slug}`) }}
          </ds-button>
        </ds-flex-item>
      </div>
    </ds-flex>
    <p class="small-info">
      {{
        $t('contribution.categories.infoSelectedNoOfMaxCategories', {
          chosen: selectedCount,
          max: selectedMax,
        })
      }}
    </p>
  </div>
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
