<template>
  <ds-container width="medium">
    <card-with-columns>
      <template v-slot:left>
        <locale-switch offset="5" />
        <img class="signup-image" alt="Human Connection" src="/img/sign-up/nicetomeetyou.svg" />
      </template>
      <template v-slot:right>
        <nuxt-child />
      </template>
    </card-with-columns>
  </ds-container>
</template>

<script>
import CardWithColumns from '~/components/_new/generic/CardWithColumns/CardWithColumns'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'

export default {
  components: {
    CardWithColumns,
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
