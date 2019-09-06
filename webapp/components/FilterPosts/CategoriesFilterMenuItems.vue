<template>
  <ds-space margin-top="large">
    <ds-flex id="filter-posts-header">
      <ds-heading tag="h4">{{ $t('filter-posts.categories.header') }}</ds-heading>
      <ds-space margin-bottom="large" />
    </ds-flex>
    <ds-flex :gutter="{ lg: 'small' }">
      <ds-flex-item
        :width="{ base: '100%', sm: '100%', md: '100%', lg: '5%' }"
        class="categories-menu-item"
      >
        <ds-flex>
          <ds-flex-item width="10%" />
          <ds-flex-item width="100%">
            <ds-button
              icon="check"
              @click.stop.prevent="resetCategories"
              :primary="!filteredCategoryIds.length"
            />
            <ds-flex-item>
              <label class="category-labels">{{ $t('filter-posts.categories.all') }}</label>
            </ds-flex-item>
            <ds-space />
          </ds-flex-item>
        </ds-flex>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '0%', sm: '0%', md: '0%', lg: '4%' }" />
      <ds-flex-item
        :width="{ base: '0%', sm: '0%', md: '0%', lg: '3%' }"
        id="categories-menu-divider"
      />
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
                :primary="filteredCategoryIds.includes(category.id)"
                @click.stop.prevent="toggleCategory(category.id)"
              />
              <ds-space margin-bottom="small" />
            </ds-flex-item>
            <ds-flex>
              <ds-flex-item class="categories-menu-item">
                <label class="category-labels">
                  {{ $t(`contribution.category.name.${category.slug}`) }}
                </label>
              </ds-flex-item>
              <ds-space margin-bottom="xx-large" />
            </ds-flex>
          </ds-flex>
        </ds-flex>
      </ds-flex-item>
    </ds-flex>
  </ds-space>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  props: {
    chunk: { type: Array, default: () => [] },
  },
  computed: {
    ...mapGetters({
      filteredCategoryIds: 'postsFilter/filteredCategoryIds',
    }),
  },
  methods: {
    ...mapMutations({
      resetCategories: 'postsFilter/RESET_CATEGORIES',
      toggleCategory: 'postsFilter/TOGGLE_CATEGORY',
    }),
  },
}
</script>
<style lang="scss">
.categories-menu-item {
  text-align: center;
}

.categories-menu {
  justify-content: center;
}

.category-labels,
.follow-label {
  font-size: $font-size-small;
}

@media only screen and (min-width: 960px) {
  #categories-menu-divider {
    border-left: 1px solid $border-color-soft;
    margin: 9px 0px 40px 0px;
  }
}
</style>
