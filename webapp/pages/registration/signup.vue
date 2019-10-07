<template>
  <signup :invitation="false" @submit="handleSubmitted">
    <ds-space centered margin-top="large">
      <nuxt-link to="/login">{{ $t('site.back-to-login') }}</nuxt-link>
    </ds-space>
  </signup>
</template>

<script>
import Signup from '~/components/Registration/Signup'

export default {
  layout: 'no-header',
  components: {
    Signup,
  },
  methods: {
    handleSubmitted({ email }) {
      this.$router.push({ path: 'enter-nonce', query: { email } })
    },
  },
}
</script>

<style lang="scss" scoped>
.signup-image {
  width: 90%;
  max-width: 200px;
}
.login-card {
  position: relative;
}
</style>
