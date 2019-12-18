<template>
  <div class="emotions-button">
    <base-button circle ghost @click="toggleEmotion(emotion)">
      <img :src="iconPath" />
    </base-button>
    <ds-space margin-bottom="xx-small" />
    <div class="emotions-mobile-space">
      <p class="emotions-label">{{ $t(`contribution.emotions-label.${emotion}`) }}</p>
      <p style="display: inline" :key="PostsEmotionsCountByEmotion[emotion]">
        {{ PostsEmotionsCountByEmotion[emotion] }}x
      </p>
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
.emotions-button {
  > .base-button {
    padding: 0;

    &:hover {
      padding: 2px;
    }
  }
}

.emotions-flex {
  width: 100%;
  justify-content: space-evenly;
  text-align: center;
}

.emotions-label {
  font-size: $font-size-small;
}

@media only screen and (max-width: 960px) {
  .emotions-mobile-space {
    margin-bottom: 32px;
  }
}
</style>
