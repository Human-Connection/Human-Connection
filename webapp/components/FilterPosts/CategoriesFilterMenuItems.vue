<template>
  <ds-container>
    <categories-filters :chunk="chunk" />
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
import CategoriesFilters from './CategoriesFilters'

export default {
  components: {
    CategoriesFilters,
  },
  props: {
    chunk: { type: Array, default: () => [] },
  },
  computed: {
    ...mapGetters({
      filteredByUsersFollowed: 'postsFilter/filteredByUsersFollowed',
    }),
  },
  methods: {
    ...mapMutations({
      toggleFilteredByFollowed: 'postsFilter/TOGGLE_FILTER_BY_FOLLOWED',
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

@media only screen and (max-width: 960px) {
  #filter-posts-header {
    text-align: center;
  }
  .follow-button {
    float: left;
  }
}
</style>
