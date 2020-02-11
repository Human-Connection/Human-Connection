<template>
  <ds-tag class="hc-hashtag">
    <nuxt-link :to="hashtagUrl">#{{ id }}</nuxt-link>
  </ds-tag>
</template>

<script>
export default {
  name: 'HcHashtag',
  props: {
    id: { type: String, required: true },
  },
  computed: {
    hashtagUrl() {
      return `/?hashtag=${this.id}`
    },
  },
}
</script>
