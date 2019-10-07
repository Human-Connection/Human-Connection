<template>
  <enter-nonce :email="email" @nonceEntered="nonceEntered">
    <ds-space margin-bottom="xxx-small" margin-top="large" centered>
      <nuxt-link to="/login">{{ $t('site.back-to-login') }}</nuxt-link>
    </ds-space>
  </enter-nonce>
</template>

<script>
import EnterNonce from '~/components/EnterNonce/EnterNonce.vue'
export default {
  components: {
    EnterNonce,
  },
  data() {
    const { email = '' } = this.$route.query
    return { email }
  },
  methods: {
    nonceEntered({ email, nonce }) {
      this.$router.push({ path: 'create-user-account', query: { email, nonce } })
    },
  },
}
</script>
