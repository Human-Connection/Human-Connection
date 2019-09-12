<template>
  <nuxt-child />
</template>

<script>
export default {
  layout: 'default',
  asyncData({ store, redirect }) {
    if (store.getters['auth/isLoggedIn']) {
      redirect('/')
    }
  },
}
</script>
