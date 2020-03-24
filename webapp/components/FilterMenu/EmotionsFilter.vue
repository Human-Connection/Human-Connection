<template>
  <filter-menu-section :title="$t('filter-menu.emotions')" class="emotions-filter">
    <template #sidebar>
      <labeled-button
        :filled="!filteredByEmotions.length"
        icon="check"
        :label="$t('filter-menu.all')"
        @click="resetEmotions"
      />
    </template>
    <template #filter-list>
      <li v-for="emotion in emotionsArray" :key="emotion" class="item">
        <emotion-button
          :emojiPath="iconPath(emotion)"
          :emotion="emotion"
          @toggleEmotion="toogleFilteredByEmotions(emotion)"
        />
      </li>
    </template>
  </filter-menu-section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import EmotionButton from '~/components/EmotionButton/EmotionButton'
import FilterMenuSection from '~/components/FilterMenu/FilterMenuSection'
import LabeledButton from '~/components/_new/generic/LabeledButton/LabeledButton'

export default {
  components: {
    EmotionButton,
    FilterMenuSection,
    LabeledButton,
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
