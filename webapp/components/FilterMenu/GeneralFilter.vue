<template>
  <ds-space>
    <ds-flex id="filter-menu-by-followers-header">
      <ds-heading tag="h4">{{ $t('filter-menu.general.header') }}</ds-heading>
      <ds-space margin-bottom="large" />
    </ds-flex>
    <ds-flex :gutter="{ lg: 'large' }">
      <ds-flex-item
        :width="{ base: '100%', sm: '100%', md: '10%', lg: '10%' }"
        class="follow-filter"
      >
        <base-button
          data-test="filter-by-followed"
          icon="user-plus"
          circle
          :filled="filteredByUsersFollowed"
          @click="toggleFilteredByFollowed(currentUser.id)"
          v-tooltip="{
            content: this.$t('contribution.filterFollow'),
            placement: 'left',
            delay: { show: 500 },
          }"
        />
        <label class="follow-label">{{ $t('filter-menu.followers.label') }}</label>
      </ds-flex-item>
      <emotion-button
        v-for="emotion in emotionsArray"
        :key="emotion"
        :emojiPath="iconPath(emotion)"
        :emotion="emotion"
        @toggleEmotion="toogleFilteredByEmotions(emotion)"
      />
      <ds-space margin-bottom="large" />
    </ds-flex>
  </ds-space>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import EmotionButton from '~/components/EmotionButton/EmotionButton'

export default {
  components: {
    EmotionButton,
  },
  data() {
    return {
      emotionsArray: ['funny', 'happy', 'surprised', 'cry', 'angry'],
    }
  },
  computed: {
    ...mapGetters({
      filteredByUsersFollowed: 'posts/filteredByUsersFollowed',
      filteredByEmotions: 'posts/filteredByEmotions',
      currentUser: 'auth/user',
    }),
  },
  methods: {
    ...mapMutations({
      toggleFilteredByFollowed: 'posts/TOGGLE_FILTER_BY_FOLLOWED',
      toogleFilteredByEmotions: 'posts/TOGGLE_EMOTION',
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
#filter-menu-header {
  display: block;
}

#filter-menu-by-followers-header {
  display: block;
}

.follow-filter.ds-flex-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $space-base;

  > .follow-label {
    margin-top: $space-x-small;
    text-align: center;
  }
}

@media only screen and (max-width: 960px) {
  #filter-menu-header {
    text-align: center;
  }
}

.text-center {
  text-align: center;
}
</style>
