<template>
  <div>
    <ds-flex :gutter="{ base: 'xx-small', md: 'small', lg: 'xx-small' }">
      <div v-for="category in categories" :key="category.id">
        <ds-flex-item>
          <ds-button
            size="small"
            @click.prevent="toggleCategory(category.id)"
            :primary="isActive(category.id)"
            :disabled="isDisabled(category.id)"
          >
            <ds-icon :name="category.icon" />
            {{ category.name }}
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
import gql from 'graphql-tag'

export default {
  props: {
    existingCategoryIds: { type: Array, default: () => [] },
  },
  data() {
    return {
      categories: null,
      selectedMax: 3,
      selectedCategoryIds: [],
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
  watch: {
    selectedCategoryIds(categoryIds) {
      this.$emit('updateCategories', categoryIds)
    },
    existingCategoryIds: {
      immediate: true,
      handler: function(existingCategoryIds) {
        if (!existingCategoryIds || !existingCategoryIds.length) {
          return
        }
        this.selectedCategoryIds = existingCategoryIds
      },
    },
  },
  methods: {
    toggleCategory(id) {
      const index = this.selectedCategoryIds.indexOf(id)
      if (index > -1) {
        this.selectedCategoryIds.splice(index, 1)
      } else {
        this.selectedCategoryIds.push(id)
      }
    },
    isActive(id) {
      const index = this.selectedCategoryIds.indexOf(id)
      if (index > -1) {
        return true
      }
      return false
    },
    isDisabled(id) {
      return !!(this.reachedMaximum && !this.isActive(id))
    },
  },
  apollo: {
    Category: {
      query() {
        return gql(`{
          Category {
            id
            name
            icon
          }
        }`)
      },
      result(result) {
        this.categories = result.data.Category
      },
    },
  },
}
</script>
