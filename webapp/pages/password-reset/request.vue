<template>
  <password-reset @handleSubmitted="handlePasswordResetRequested" />
</template>

<script>
import PasswordReset from '~/components/PasswordReset/PasswordReset'

export default {
  components: {
    PasswordReset,
  },
  methods: {
    handlePasswordResetRequested() {
      this.$router.push('verify-code')
    },
  },
}
</script>
