<template>
  <img
    v-bind="imageProps"
    :src="imageSrc"
  >
</template>

<script>
export default {
  props: {
    imageProps: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageSrc() {
      // TODO implement
      return 'this should be an image source attribute'
    }
  }
}
</script>
