<template>
  <section class="emotion-filter">
    <h4 class="title">{{ $t('filter-menu.emotions') }}</h4>
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
      filteredByEmotions: 'posts/filteredByEmotions',
      currentUser: 'auth/user',
    }),
  },
  methods: {
    ...mapMutations({
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
.emotion-filter {
  display: flex;
  flex-wrap: wrap;
  margin-top: $space-base;

  > .title {
    width: 100%;
    margin-bottom: $space-base;
  }

  > .divider {
    border-left: $border-size-base solid $border-color-soft;
    margin: 0px $space-base 0px 76px;
  }
}

@media only screen and (max-width: 630px) {
  .emotion-filter {
    > .title {
      text-align: center;
    }

    > .divider {
      border-top: $border-size-base solid $border-color-soft;
    }
  }
}
</style>
