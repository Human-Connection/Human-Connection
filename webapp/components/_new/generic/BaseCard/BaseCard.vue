<template>
  <article class="base-card">
    <slot />
  </article>
</template>

<script>
export default {

}
</script>

<style lang="scss">
.base-card {
  padding: $space-base;
  border-radius: $border-radius-x-large;
  overflow: hidden;
  background-color: $color-neutral-100;
  box-shadow: $box-shadow-base;

  > .card-image {
    width: calc(100% + (2 * #{$space-base}));
    margin: -$space-base;
    margin-bottom: $space-base;
    font-size: $font-size-x-large;
  }

  > .card-heading {
    margin-bottom: $space-x-small;
  }
}
</style>
