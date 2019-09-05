<template>
  <nuxt-child />
</template>

<script>
export default {
  layout: 'basic',
  asyncData({ store, redirect }) {
    if (store.getters['auth/isLoggedIn']) {
      redirect('/')
    }
  },
}
</script>
