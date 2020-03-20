<template>
  <section class="emotions-filter">
    <h4 class="title">{{ $t('filter-menu.emotions') }}</h4>
    <labeled-button
      :filled="!filteredByEmotions.length"
      icon="check"
      :label="$t('filter-menu.all')"
      @click="resetEmotions"
    />
    <div class="divider" />
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
import LabeledButton from '~/components/_new/generic/LabeledButton/LabeledButton'
import EmotionButton from '~/components/EmotionButton/EmotionButton'

export default {
  components: {
    LabeledButton,
    EmotionButton,
  },
  data() {
    return {
      emotionsArray: ['funny', 'happy', 'surprised', 'cry', 'angry'],
    }
  },
  computed: {
    ...mapGetters({
      filteredByEmotions: 'posts/filteredByEmotions',
      currentUser: 'auth/user',
    }),
  },
  methods: {
    ...mapMutations({
      resetEmotions: 'posts/RESET_EMOTIONS',
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
.emotions-filter {
  display: flex;
  flex-wrap: wrap;
  margin-top: $space-base;
  width: 66%;

  > .title {
    width: 100%;
    margin-bottom: $space-base;
  }

  > .divider {
    border-left: $border-size-base solid $border-color-soft;
    margin: 0px $space-base;
  }

  @media only screen and (max-width: 630px) {
    width: 100%;

    > .title {
      text-align: center;
    }

    .labeled-button {
      width: 100%;
      margin: $space-x-small 0;
    }

    > .divider {
      width: 100%;
      margin: $space-small;
      border-top: $border-size-base solid $border-color-soft;
    }

    > .emotion-button {
      margin-top: $space-x-small;
    }
  }
}
</style>
