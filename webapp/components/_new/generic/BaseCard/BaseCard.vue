<template>
  <article class="base-card">
    <slot />
  </article>
</template>

<script>
export default {}
</script>

<style lang="scss">
.base-card {
  padding: $space-base;
  border-radius: $border-radius-x-large;
  overflow: hidden;
  background-color: $color-neutral-100;
  box-shadow: $box-shadow-base;

  &.--highlight {
    border: $border-size-base solid $color-primary;
  }

  &.--wide-content {
    padding: $space-small;

    > .card-image {
      width: calc(100% + (2 * #{$space-small}));
      margin: -$space-small;
      margin-bottom: $space-base;
    }
  }

  > .card-image {
    width: calc(100% + (2 * #{$space-base}));
    margin: -$space-base;
    margin-bottom: $space-base;
    font-size: $font-size-x-large;
  }

  > .card-heading {
    font-size: $font-size-large;
    margin-bottom: $space-x-small;
  }
}
</style>
