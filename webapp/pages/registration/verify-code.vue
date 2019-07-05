<template>
  <verify-code :email="email" @verification="handleVerification" />
</template>

<script>
import VerifyCode from '~/components/PasswordReset/VerifyCode'

export default {
  components: {
    VerifyCode,
  },
  data() {
    const { email = '' } = this.$route.query
    return { email }
  },
  methods: {
    handleVerification({ email, code }) {
      this.$router.push({ path: 'create-user-account', query: { email, code } })
    },
  },
}
</script>
