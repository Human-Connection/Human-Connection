<template>
  <div class="error-container">
    <base-icon class="error-icon" name="exclamation-circle" />
    <br />
    <span v-if="error.message === 'This page could not be found'" class="error-message">
      {{ $t('error-pages.default') }}
    </span>
    <span v-else class="error-message">{{ $t(error.message) }}</span>
    <br />
    <nuxt-link to="/">{{ $t('error-pages.back-to-index') }}</nuxt-link>
  </div>
</template>

<script>
export default {
  props: ['error'],
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
.error-icon {
  font-size: $font-size-xxx-large;
  color: $text-color-softer;
}
</style>
