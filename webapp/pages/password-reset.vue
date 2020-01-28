<template>
  <ds-container width="small">
    <ds-card>
      <ds-flex gutter="small">
        <ds-flex-item :width="{ base: '100%', sm: '40%' }">
          <client-only>
            <locale-switch offset="5" />
          </client-only>
          <ds-space margin-top="small" margin-bottom="xxx-small" centered>
            <img alt="Human Connection" src="/icon.png" />
          </ds-space>
        </ds-flex-item>
        <ds-flex-item :width="{ base: '100%', sm: '60%' }" centered>
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
<style lang="scss" scoped>
img {
  padding-left: 50px;
  padding-right: 50px;
  max-width: 200px;
}
</style>
