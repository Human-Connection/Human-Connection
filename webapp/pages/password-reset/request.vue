<template>
  <request @handleSubmitted="handlePasswordResetRequested" />
</template>

<script>
import Request from '~/components/PasswordReset/Request'

export default {
  components: {
    Request,
  },
  methods: {
    handlePasswordResetRequested() {
      this.$router.push('verify-code')
    },
  },
}
</script>
