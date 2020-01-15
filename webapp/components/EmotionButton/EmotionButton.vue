<template>
  <div class="emotion-button">
    <base-button :id="emotion" circle ghost @click="$emit('toggleEmotion', emotion)">
      <img class="image" :src="emojiPath" />
    </base-button>
    <label class="label" :for="emotion">{{ $t(`contribution.emotions-label.${emotion}`) }}</label>
    <p v-if="emotionCount !== null" class="count">{{ emotionCount }}x</p>
  </div>
</template>

<script>
export default {
  name: 'EmotionButton',
  props: {
    emojiPath: {
      type: String,
      required: true,
    },
    emotion: {
      type: String,
      required: true,
    },
    emotionCount: {
      type: Number,
      default: null,
    },
  },
}
</script>

<style lang="scss">
.emotion-button {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  > .base-button {
    padding: 0;

    &:hover {
      padding: $space-xxx-small;
    }
  }

  > .label {
    margin-top: $space-x-small;
    font-size: $font-size-small;
    cursor: pointer;
  }

  > .count {
    margin: $space-x-small 0;
  }

  .image {
    max-width: $size-button-base;
    height: 100%;
  }
}
</style>
