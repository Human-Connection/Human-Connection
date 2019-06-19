<template>
  <verify-code @verification="handleVerification" />
</template>

<script>
import VerifyCode from '~/components/PasswordReset/VerifyCode'

export default {
  components: {
    VerifyCode,
  },
  methods: {
    handleVerification({ email, code }) {
      this.$router.push({ path: 'change-password', query: { email, code } })
    },
  },
}
</script>
