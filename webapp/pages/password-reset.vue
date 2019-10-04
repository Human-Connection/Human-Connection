<template>
  <ds-container width="small">
    <ds-card>
      <client-only>
        <locale-switch offset="5" />
      </client-only>
      <nuxt-child />
      <ds-space margin="x-small"></ds-space>
    </ds-card>
  </ds-container>
</template>

<script>
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'

export default {
  components: {
    LocaleSwitch,
  },
  layout: 'no-header',
  asyncData({ store, redirect }) {
    if (store.getters['auth/isLoggedIn']) {
      redirect('/')
    }
  },
}
</script>
<style lang="scss" scoped>
img {
  padding-left: 50px;
  padding-right: 50px;
  max-width: 200px;
}
</style>
