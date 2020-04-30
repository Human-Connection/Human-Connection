<template>
  <ds-heading soft size="h5" class="search-heading">
    {{ $t(`search.heading.${resourceType}`, {}, 2) }}
  </ds-heading>
</template>
<script>
export default {
  name: 'SearchHeading',
  props: {
    resourceType: { type: String, required: true },
  },
}
</script>
<style lang="scss">
.search-heading.ds-heading {
  margin: -$space-x-small;
  padding: $space-x-small;
  background-color: $color-neutral-100;
  font-weight: $font-weight-bold;
  cursor: default;
}

// override styleguide styles
.search-heading.ds-heading:first-child {
  margin-top: -$space-x-small;
}
</style>
