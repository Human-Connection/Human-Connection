<template>
  <ds-flex-item>
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
<style></style>
