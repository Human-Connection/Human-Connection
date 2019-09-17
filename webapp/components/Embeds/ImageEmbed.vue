<template>
  <div class="image-embed">
    <a :href="url" target="_blank" class="image-embed-link">
      <img :src="embedData.image" />
    </a>
  </div>
</template>

<script>
export default {
  name: 'image-embed',
  props: {
    url: {
      type: String,
      default: '',
    },
    embedData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
}
</script>

<style lang="scss">
.image-embed {
  position: relative;
  text-align: center;
  background-color: $background-color-base;
  border: 1px solid $background-color-inverse-soft;

  img {
    max-height: 800px;
    width: 100%;
    object-fit: contain;
    display: block;
    margin: 0 auto;
  }
}
</style>
