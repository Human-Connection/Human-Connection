<template>
  <verify-code @passwordResetResponse="handlePasswordResetResponse" />
</template>

<script>
import VerifyCode from '~/components/PasswordReset/VerifyCode'

export default {
  components: {
    VerifyCode,
  },
  methods: {
    handlePasswordResetResponse(response) {
      if (response === 'success') {
        this.$router.push('login')
      }
    },
  },
}
</script>
