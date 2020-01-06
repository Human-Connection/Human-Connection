<template>
  <ds-flex-item>
    <span class="hashtag-search-text">#{{ option.id }}</span>
  </ds-flex-item>
</template>
<script>
export default {
  name: 'SearchTag',
  props: {
    option: { type: Object, required: true },
  },
}
</script>
<style lang="scss">
.hashtag-search-text {
  color: rgb(23, 181, 63);
}
</style>
