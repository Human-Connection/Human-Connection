<template>
  <signup v-if="publicRegistration" :invitation="false" @submit="handleSubmitted">
    <ds-space centered margin-top="large">
      <nuxt-link to="/login">{{ $t('site.back-to-login') }}</nuxt-link>
    </ds-space>
  </signup>
  <ds-space v-else centered>
    <hc-empty icon="events" :message="$t('components.registration.signup.unavailable')" />
    <nuxt-link to="/login">{{ $t('site.back-to-login') }}</nuxt-link>
  </ds-space>
</template>

<script>
import Signup from '~/components/Registration/Signup'
import HcEmpty from '~/components/Empty.vue'

export default {
  layout: 'no-header',
  components: {
    HcEmpty,
    Signup,
  },
  asyncData({ app }) {
    return {
      publicRegistration: app.$env.PUBLIC_REGISTRATION === 'true',
    }
  },
  methods: {
    handleSubmitted({ email }) {
      this.$router.push({ path: 'enter-nonce', query: { email } })
    },
  },
}
</script>
