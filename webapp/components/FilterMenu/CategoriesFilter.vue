<template>
  <filter-menu-section :title="$t('filter-menu.categories')" class="categories-filter">
    <template #sidebar>
      <labeled-button
        :filled="!filteredCategoryIds.length"
        :label="$t('filter-menu.all')"
        icon="check"
        @click="resetCategories"
      />
    </template>
    <template #filter-list>
      <li v-for="category in categories" :key="category.id" class="item">
        <labeled-button
          :icon="category.icon"
          :filled="filteredCategoryIds.includes(category.id)"
          :label="$t(`contribution.category.name.${category.slug}`)"
          @click="toggleCategory(category.id)"
        />
      </li>
    </template>
  </filter-menu-section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import CategoryQuery from '~/graphql/CategoryQuery.js'
import FilterMenuSection from '~/components/FilterMenu/FilterMenuSection'
import LabeledButton from '~/components/_new/generic/LabeledButton/LabeledButton'

export default {
  components: {
    FilterMenuSection,
    LabeledButton,
  },
  data() {
    return {
      categories: [],
    }
  },
  computed: {
    ...mapGetters({
      filteredCategoryIds: 'posts/filteredCategoryIds',
    }),
  },
  methods: {
    ...mapMutations({
      resetCategories: 'posts/RESET_CATEGORIES',
      toggleCategory: 'posts/TOGGLE_CATEGORY',
    }),
  },
  apollo: {
    Category: {
      query() {
        return CategoryQuery()
      },
      update({ Category }) {
        if (!Category) return []
        this.categories = Category
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
