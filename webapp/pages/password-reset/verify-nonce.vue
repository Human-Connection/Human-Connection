<template>
  <verify-nonce :email="email" @verification="handleVerification" />
</template>

<script>
import VerifyNonce from '~/components/PasswordReset/VerifyNonce'

export default {
  components: {
    VerifyNonce,
  },
  data() {
    const { email = '' } = this.$route.query
    return { email }
  },
  methods: {
    handleVerification({ email, nonce }) {
      this.$router.push({ path: 'change-password', query: { email, nonce } })
    },
  },
}
</script>
