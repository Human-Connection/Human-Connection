<template>
  <ds-flex class="search-tag">
    <ds-flex-item class="search-tag-label">
      <ds-text>#{{ option.id }}</ds-text>
    </ds-flex-item>
  </ds-flex>
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
 .search-tag {
     width: 100%;
 }
 .search-tag-label {
     color: $text-color-primary;
 }
</style>
