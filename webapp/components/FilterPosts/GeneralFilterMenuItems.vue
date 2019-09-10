<template>
  <ds-space>
    <ds-flex id="filter-posts-by-followers-header">
      <ds-heading tag="h4">{{ $t('filter-posts.general.header') }}</ds-heading>
      <ds-space margin-bottom="large" />
    </ds-flex>
    <ds-flex :gutter="{ lg: 'large' }">
      <ds-flex-item
        :width="{ base: '100%', sm: '100%', md: '100%', lg: '10%' }"
        class="categories-menu-item"
      >
        <ds-flex>
          <ds-flex-item width="10%" />
          <ds-space margin-bottom="xx-small" />
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
              <ds-space margin-bottom="x-small" />
              <ds-flex-item>
                <label class="follow-label">{{ $t('filter-posts.followers.label') }}</label>
              </ds-flex-item>
              <ds-space />
            </div>
          </ds-flex-item>
        </ds-flex>
      </ds-flex-item>
      <div v-for="emotion in emotionsArray" :key="emotion">
        <ds-flex-item :width="{ lg: '100%' }">
          <ds-button
            size="large"
            ghost
            @click="toogleFilteredByEmotions(emotion)"
            class="emotions-buttons"
          >
            <img :src="iconPath(emotion)" width="40" />
          </ds-button>
          <ds-space margin-bottom="x-small" />
          <ds-flex-item class="emotions-mobile-space text-center">
            <label class="emotions-label">{{ $t(`contribution.emotions-label.${emotion}`) }}</label>
          </ds-flex-item>
        </ds-flex-item>
      </div>
      <ds-space margin-bottom="large" />
    </ds-flex>
  </ds-space>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  props: {
    user: { type: Object, required: true },
  },
  data() {
    return {
      emotionsArray: ['funny', 'happy', 'surprised', 'cry', 'angry'],
    }
  },
  computed: {
    ...mapGetters({
      filteredByUsersFollowed: 'postsFilter/filteredByUsersFollowed',
      filteredByEmotions: 'postsFilter/filteredByEmotions',
    }),
  },
  methods: {
    ...mapMutations({
      toggleFilteredByFollowed: 'postsFilter/TOGGLE_FILTER_BY_FOLLOWED',
      toogleFilteredByEmotions: 'postsFilter/TOGGLE_EMOTION',
    }),
    iconPath(emotion) {
      if (this.filteredByEmotions.includes(emotion)) {
        return `/img/svg/emoji/${emotion}_color.svg`
      }
      return `/img/svg/emoji/${emotion}.svg`
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

@media only screen and (max-width: 960px) {
  #filter-posts-header {
    text-align: center;
  }
  .follow-button {
    float: left;
  }
}

.text-center {
  text-align: center;
}
</style>
