<template>
  <ds-tag>
    <a v-bind:href="`/?hashtag=${id}`" target="_blank">#{{ id }}</a>
  </ds-tag>
</template>

<script>
export default {
  name: 'HcHashtag',
  props: {
    id: { type: String, required: true },
  },
}
</script>
