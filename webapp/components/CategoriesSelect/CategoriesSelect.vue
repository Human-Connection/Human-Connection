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
            {{ $t(`contribution.category.name.${category.slug}`) }}   <!-- i18n-variable -->
<!-- i18n $t(`contribution.category.name.freedom-of-speech`)           -->
<!-- i18n $t(`contribution.category.name.consumption-sustainability`)  -->
<!-- i18n $t(`contribution.category.name.global-peace-nonviolence`)    -->
<!-- i18n $t(`contribution.category.name.just-for-fun`)                -->
<!-- i18n $t(`contribution.category.name.happiness-values`)            -->
<!-- i18n $t(`contribution.category.name.health-wellbeing`)            -->
<!-- i18n $t(`contribution.category.name.environment-nature`)          -->
<!-- i18n $t(`contribution.category.name.animal-protection`)           -->
<!-- i18n $t(`contribution.category.name.human-rights-justice`)        -->
<!-- i18n $t(`contribution.category.name.education-sciences`)          -->
<!-- i18n $t(`contribution.category.name.cooperation-development`)     -->
<!-- i18n $t(`contribution.category.name.democracy-politics`)          -->
<!-- i18n $t(`contribution.category.name.economy-finances`)            -->
<!-- i18n $t(`contribution.category.name.energy-technology`)           -->
<!-- i18n $t(`contribution.category.name.it-internet-data-privacy`)    -->
<!-- i18n $t(`contribution.category.name.art-culture-sport`)           -->
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
        return CategoryQuery()
      },
      result({ data: { Category } }) {
        this.categories = Category
      },
    },
  },
}
</script>
