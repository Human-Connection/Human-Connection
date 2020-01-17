<template>
  <div class="container">
    <h1>{{ $t(error.message) }}</h1>
    <nuxt-link to="/">{{ $t('error-pages.back-to-index') }}</nuxt-link>
  </div>
</template>

<script>
export default {
  props: ['error'],
}
</script>
