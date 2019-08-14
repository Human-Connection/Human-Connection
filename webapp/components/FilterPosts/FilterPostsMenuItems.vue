<template>
  <ds-container>
    <ds-space />
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
    <ds-space />
    <ds-flex id="filter-posts-by-followers-header">
      <ds-heading tag="h4">{{ $t('filter-posts.general.header') }}</ds-heading>
      <ds-space margin-bottom="large" />
    </ds-flex>
    <ds-flex>
      <ds-flex-item
        :width="{ base: '100%', sm: '100%', md: '100%', lg: '10%' }"
        class="categories-menu-item"
      >
        <ds-flex>
          <ds-flex-item width="10%" />
          <ds-flex-item width="100%">
            <div class="follow-button">
              <ds-button
                v-tooltip="{
                  content: this.$t('contribution.filterFollow'),
                  placement: 'left',
                  delay: { show: 500 },
                }"
                name="filter-by-followed-authors-only"
                icon="user-plus"
                :primary="filteredByUsersFollowed"
                @click="toggleFilteredByFollowed(user.id)"
              />
              <ds-flex-item>
                <label class="follow-label">{{ $t('filter-posts.followers.label') }}</label>
              </ds-flex-item>
              <ds-space />
            </div>
          </ds-flex-item>
        </ds-flex>
      </ds-flex-item>
      <ds-space margin-bottom="large" />
    </ds-flex>
  </ds-container>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  props: {
    user: { type: Object, required: true },
    chunk: { type: Array, default: () => [] },
  },
  data() {
    return {
      filter: {},
    }
  },
  computed: {
    ...mapGetters({
      filteredCategoryIds: 'postsFilter/filteredCategoryIds',
      filteredByUsersFollowed: 'postsFilter/filteredByUsersFollowed',
    }),
  },
  methods: {
    ...mapMutations({
      toggleFilteredByFollowed: 'postsFilter/TOGGLE_FILTER_BY_FOLLOWED',
      resetCategories: 'postsFilter/RESET_CATEGORIES',
      toggleCategory: 'postsFilter/TOGGLE_CATEGORY',
    }),
  },
}
</script>
<style lang="scss">
#filter-posts-header {
  display: block;
}

#filter-posts-by-followers-header {
  display: block;
}

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

@media only screen and (max-width: 960px) {
  #filter-posts-header {
    text-align: center;
  }
  .follow-button {
    float: left;
  }
}
</style>
