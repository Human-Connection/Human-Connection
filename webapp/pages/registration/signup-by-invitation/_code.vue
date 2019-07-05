<template>
  <signup :token="token" @signupResponse="handleSignupResponse" />
</template>

<script>
import Signup from '~/components/Registration/Signup'

export default {
  components: {
    Signup,
  },
  data() {
    const { code: token } = this.$route.params
    return { token }
  },
  methods: {
    handleSignupResponse(response) {
      if (response === 'success') {
        this.$router.push({ path: 'verify-code' })
      }
    },
  },
}
</script>
