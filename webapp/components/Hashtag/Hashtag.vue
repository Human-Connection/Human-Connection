<template>
  <a v-bind:href="`/?hashtag=${id}`" target="_blank">#{{ id }}</a>
</template>

<script>
export default {
  name: 'HcHashtag',
  props: {
    id: { type: String, required: true },
  },
}
</script>
