<template>
  <aside class="ribbon">
    <p>{{ text }}</p>
  </aside>
</template>

<script>
export default {
  name: 'HcRibbon',
  props: {
    text: {
      type: String,
      default: '',
    },
  },
}
</script>

<style scoped lang="scss">
.ribbon {
  padding: $size-ribbon $size-ribbon;
  border-radius: $border-radius-small 0 0 $border-radius-small;
  color: $color-neutral-100;
  background-color: $background-color-secondary-active;
  font-size: $font-size-x-small;
  font-weight: $font-weight-bold;

  &::before {
    content: ' ';
    position: absolute;
    right: 0;
    bottom: -$size-ribbon;
    border-width: $border-size-large 4px $border-size-large $border-size-large;
    border-style: solid;
    border-color: $background-color-secondary transparent transparent $background-color-secondary;
  }

  &.--pinned {
    background-color: $color-warning;

    &::before {
      border-color: $color-warning transparent transparent $color-warning;
    }
  }
}
</style>
