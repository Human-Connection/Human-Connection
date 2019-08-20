<template>
  <div>
    <ds-button size="large" ghost @click="toggleEmotion(emotion)" class="emotions-buttons">
      <img :src="iconPath" width="40" />
    </ds-button>
    <ds-space margin-bottom="xx-small" />
    <div class="emotions-mobile-space">
      <p class="emotions-label">{{ $t(`contribution.emotions-label.${emotion}`) }}</p>
      <p style="display: inline" :key="PostsEmotionsCountByEmotion[emotion]">
        {{ PostsEmotionsCountByEmotion[emotion] }}x
      </p>
      {{ $t('contribution.emotions-label.emoted') }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    iconPath: { type: String, default: null },
    PostsEmotionsCountByEmotion: { type: Object, default: () => {} },
    emotion: { type: String, default: null },
  },
  methods: {
    toggleEmotion(emotion) {
      this.$emit('toggleEmotion', emotion)
    },
  },
}
</script>
<style lang="scss">
.emotions-flex {
  justify-content: space-evenly;
  text-align: center;
}

.emotions-label {
  font-size: $font-size-small;
}

.emotions-buttons {
  &:hover {
    background-color: $background-color-base;
  }
}
@media only screen and (max-width: 960px) {
  .emotions-mobile-space {
    margin-bottom: 32px;
  }
}
</style>
