<template>
  <div class="default-embed">
    <a :href="url" target="_blank">
      <img v-show="previewImage.length" :src="previewImage" width="100%" />
      {{ url }}
    </a>
  </div>
</template>

<script>
export default {
  name: 'default-embed',
  props: {
    url: {
      type: String,
      default: '',
    },
    previewImage: {
      type: String,
      default: '',
    },
  },
}
</script>
