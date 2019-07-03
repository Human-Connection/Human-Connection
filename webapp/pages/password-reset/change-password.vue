<template>
  <change-password
    :email="email"
    :code="code"
    @passwordResetResponse="handlePasswordResetResponse"
  />
</template>

<script>
import ChangePassword from '~/components/PasswordReset/ChangePassword'

export default {
  data() {
    const { email = '', code = '' } = this.$route.query
    return { email, code }
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
