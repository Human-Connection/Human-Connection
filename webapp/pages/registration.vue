<template>
  <ds-container width="medium">
    <ds-card>
      <ds-flex gutter="small">
        <ds-flex-item :width="{ base: '100%', sm: '50%' }">
          <client-only>
            <locale-switch offset="5" />
          </client-only>
          <ds-space margin-top="small" margin-bottom="xxx-small">
            <img class="signup-image" alt="Human Connection" src="/img/sign-up/nicetomeetyou.svg" />
          </ds-space>
        </ds-flex-item>
        <ds-flex-item :width="{ base: '100%', sm: '50%' }" centered>
          <nuxt-child />
        </ds-flex-item>
      </ds-flex>
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
