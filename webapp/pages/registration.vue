<template>
  <ds-container width="medium">
    <base-card>
      <template #imageColumn>
        <img alt="Human Connection" src="/img/sign-up/nicetomeetyou.svg" />
      </template>
      <nuxt-child />
      <template #topMenu>
        <locale-switch offset="5" />
      </template>
    </base-card>
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
