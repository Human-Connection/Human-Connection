<template>
  <change-password
    :email="email"
    :nonce="nonce"
    @passwordResetResponse="handlePasswordResetResponse"
  >
    <ds-space centered>
      <nuxt-link to="/login">{{ $t('site.back-to-login') }}</nuxt-link>
    </ds-space>
  </change-password>
</template>

<script>
import ChangePassword from '~/components/PasswordReset/ChangePassword'

export default {
  data() {
    const { email = '', nonce = '' } = this.$route.query
    return { email, nonce }
  },
  components: {
    ChangePassword,
  },
  methods: {
    handlePasswordResetResponse(response) {
      if (response === 'success') {
        this.$router.push('/login')
      }
    },
  },
}
</script>
