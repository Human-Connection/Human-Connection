<template>
  <ds-container width="small" class="password-reset">
    <card-with-columns>
      <template v-slot:left>
        <locale-switch offset="5" />
        <img alt="Human Connection" src="/icon.png" class="image" />
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
<style lang="scss">
.password-reset {
  position: relative;

  .v-popover {
    position: absolute;
  }

  .image {
    width: 70%;
    margin: auto;
  }
}
</style>
