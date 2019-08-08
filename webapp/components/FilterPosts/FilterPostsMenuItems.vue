<template>
  <ds-container>
    <ds-space />
    <ds-flex id="filter-posts-header">
      <ds-heading tag="h4">{{ $t('filter-posts.categories.header') }}</ds-heading>
      <ds-space margin-bottom="large" />
    </ds-flex>
    <ds-flex>
      <ds-flex-item
        :width="{ base: '100%', sm: '100%', md: '100%', lg: '5%' }"
        class="categories-menu-item"
      >
        <ds-flex>
          <ds-flex-item width="10%" />
          <ds-flex-item width="100%">
            <ds-button
              icon="check"
              @click.stop.prevent="toggleCategory()"
              :primary="!filteredByCategories"
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
                @click="toggleOnlyFollowed"
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
      filteredByUsersFollowed: 'posts/filteredByUsersFollowed',
      filteredByCategories: 'posts/filteredByCategories',
      usersFollowedFilter: 'posts/usersFollowedFilter',
      categoriesFilter: 'posts/categoriesFilter',
      selectedCategoryIds: 'posts/selectedCategoryIds',
    }),
  },
  methods: {
    ...mapMutations({
      setFilteredByFollowers: 'posts/SET_FILTERED_BY_FOLLOWERS',
      setFilteredByCategories: 'posts/SET_FILTERED_BY_CATEGORIES',
      setUsersFollowedFilter: 'posts/SET_USERS_FOLLOWED_FILTER',
      setCategoriesFilter: 'posts/SET_CATEGORIES_FILTER',
      setSelectedCategoryIds: 'posts/SET_SELECTED_CATEGORY_IDS',
    }),
    isActive(id) {
      const index = this.selectedCategoryIds.indexOf(id)
      if (index > -1 && this.setFilteredByCategories) {
        return true
      }
      return false
    },
    toggleCategory(categoryId) {
      if (!categoryId) {
        this.setSelectedCategoryIds()
      } else {
        this.setSelectedCategoryIds(categoryId)
      }
      this.setFilteredByCategories(!!this.selectedCategoryIds.length)
      this.setCategoriesFilter(
        this.selectedCategoryIds.length
          ? { categories_some: { id_in: this.selectedCategoryIds } }
          : {},
      )
      this.toggleFilter()
    },
    toggleOnlyFollowed() {
      this.setFilteredByFollowers(!this.filteredByUsersFollowed)
      this.setUsersFollowedFilter(
        this.filteredByUsersFollowed ? { author: { followedBy_some: { id: this.user.id } } } : {},
      )
      this.toggleFilter()
    },
    toggleFilter() {
      this.filter = {
        ...this.usersFollowedFilter,
        ...this.categoriesFilter,
      }
      this.$emit('filterPosts', this.filter)
    },
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
