<template>
  <signup @signupResponse="handleSignupResponse" />
</template>

<script>
import Signup from '~/components/Registration/Signup'

export default {
  components: {
    Signup,
  },
  methods: {
    handleSignupResponse(response) {
      if (response === 'success') {
        this.$router.push({ path: 'verify-code' })
      }
    },
  },
  asyncData({ store, redirect }) {
    if (!store.getters['auth/isAdmin']) {
      redirect('/login')
    }
  },
}
</script>
