<template>
  <nuxt-child />
</template>

<script>
export default {
  layout: 'blank',
  asyncData({ store, redirect }) {
    if (store.getters['auth/isLoggedIn']) {
      redirect('/')
    }
  },
}
</script>
