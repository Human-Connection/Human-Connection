<template>
  <img v-bind="imageProps" :src="imageSrc" />
</template>

<script>
export default {
  props: {
    imageProps: {
      type: Object,
      required: true,
    },
  },
  computed: {
    imageSrc() {
      const src = this.imageProps.src
      return src.startsWith('/') ? src.replace('/', '/api/') : src
    },
  },
}
</script>
