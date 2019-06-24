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
    handlePasswordResetRequested({ email }) {
      this.$router.push({ path: 'verify-code', query: { email } })
    },
  },
}
</script>
