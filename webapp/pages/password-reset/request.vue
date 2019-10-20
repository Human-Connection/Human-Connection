<template>
  <request @handleSubmitted="handlePasswordResetRequested">
    <ds-space margin-bottom="xxx-small" margin-top="large" centered>
      <nuxt-link to="/login">{{ $t('site.back-to-login') }}</nuxt-link>
    </ds-space>
  </request>
</template>

<script>
import Request from '~/components/PasswordReset/Request'

export default {
  components: {
    Request,
  },
  methods: {
    handlePasswordResetRequested({ email }) {
      this.$router.push({ path: 'enter-nonce', query: { email } })
    },
  },
}
</script>
