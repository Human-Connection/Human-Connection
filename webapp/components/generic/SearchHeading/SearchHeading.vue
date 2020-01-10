<template>
  <ds-flex-item class="search-heading">
    <ds-heading soft size="h5">
      {{ $t(`search.heading.${resourceType}`) }}
    </ds-heading>
  </ds-flex-item>
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
.search-heading {
  display: flex;
  flex-wrap: wrap;
  font-weight: bold;
  cursor: default;
  background-color: white;
  margin: -8px;
  padding: 8px;
}
</style>
