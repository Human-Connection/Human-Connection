<template>
  <div class="error-container">
    <img class="error-image" :src="image" />
    <br />
    <span class="error-message">{{ $t(message) }}</span>
    <br />
    <nuxt-link to="/">{{ $t('error-pages.back-to-index') }}</nuxt-link>
  </div>
</template>

<script>
export default {
  props: ['error'],
  computed: {
    message() {
      const mapping = {
        403: 'error-pages.403-default',
        404: 'error-pages.404-default',
        500: 'error-pages.500-default',
        503: 'error-pages.503-default',
      }
      return this.error.key || mapping[this.error.statusCode] || 'error-pages.default'
    },
    image() {
      return `/img/svg/errors/error${this.error.statusCode || '500'}.svg`
    },
  },
}
</script>
<style lang="scss">
.error-container {
  text-align: center;
  padding: $space-small;
}
.error-message {
  font-size: $font-size-x-large;
  font-weight: $font-weight-bold;
  color: $text-color-softer;
  margin: $space-base;
}
.error-image {
  width: 30%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
