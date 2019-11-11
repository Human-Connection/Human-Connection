<template>
  <div class="progress-bar">
    <h4 v-if="title" class="progress-bar__title">{{ title }}</h4>
    <div class="progress-bar__goal"></div>
    <div class="progress-bar__progress" :style="progressBarWidth"></div>
    <span v-if="label" class="progress-bar__label">{{ label }}</span>
  </div>
</template>

<script>
export default {
  props: {
    goal: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
    },
    progress: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
    },
  },
  computed: {
    progressBarWidth() {
      return `width: ${(this.progress / this.goal) * 100}%;`
    },
  },
}
</script>

<style lang="scss">
.progress-bar {
  position: relative;
  height: 100%;
  width: 240px;
  margin-right: $space-x-small;
}

.progress-bar__title {
  position: absolute;
  top: -2px;
  left: $space-xx-small;
  margin: 0;
}

.progress-bar__goal {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 37.5px; // styleguide-button-size
  width: 100%;
  background-color: $color-neutral-100;
  border-radius: $border-radius-base;
}

.progress-bar__progress {
  position: absolute;
  bottom: 1px;
  left: 0;
  height: 35.5px; // styleguide-button-size - 2px border
  max-width: 100%;
  background-color: $color-yellow;
  border-radius: $border-radius-base;
}

.progress-bar__label {
  position: absolute;
  top: 50%;
  left: $space-xx-small;
}
</style>
