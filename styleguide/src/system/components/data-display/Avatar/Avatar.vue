<template>
  <div
    class="ds-avatar"
    :style="styles">
    <img :src="image">
  </div>
</template>

<script>
export default {
  name: 'DsAvatar',
  props: {
    size: { type: [Number, String], default: '32px' },
    image: { type: String, required: true }
  },
  computed: {
    styles() {
      let size = this.size
      if (Number.isInteger(Number(size))) {
        size = `${size}px`
      }
      return {
        width: size,
        height: size
      }
    }
  }
}
</script>


<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
