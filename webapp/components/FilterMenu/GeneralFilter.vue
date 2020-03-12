<template>
  <section class="general-filter">
    <h4 class="title">{{ $t('filter-menu.general.header') }}</h4>
    <div class="divider" />
    <labeled-button
      data-test="filter-by-followed"
      :filled="filteredByUsersFollowed"
      icon="user-plus"
      :label="$t('filter-menu.followers.label')"
      @click="toggleFilteredByFollowed(currentUser.id)"
      v-tooltip="{
        content: this.$t('contribution.filterFollow'),
        placement: 'left',
        delay: { show: 500 },
      }"
    />
    <emotion-button
      v-for="emotion in emotionsArray"
      :key="emotion"
      :emojiPath="iconPath(emotion)"
      :emotion="emotion"
      @toggleEmotion="toogleFilteredByEmotions(emotion)"
    />
  </section>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import EmotionButton from '~/components/EmotionButton/EmotionButton'
import LabeledButton from '~/components/_new/generic/LabeledButton/LabeledButton'

export default {
  components: {
    EmotionButton,
    LabeledButton,
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
.general-filter {
  display: flex;
  flex-wrap: wrap;
  margin-top: $space-base;

  > .title {
    width: 100%;
    margin-bottom: $space-base;
  }

  > .labeled-button {
    width: 11%;
  }

  > .divider {
    border-left: $border-size-base solid $border-color-soft;
    margin: 0px $space-base 0px 76px;
  }
}

@media only screen and (max-width: 630px) {
  .general-filter {
    > .title {
      text-align: center;
    }

    > .labeled-button {
      width: 100%;
      margin-bottom: $space-small;
    }

    > .divider {
      border-top: $border-size-base solid $border-color-soft;
    }
  }
}
</style>
