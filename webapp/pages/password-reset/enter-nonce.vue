<template>
  <enter-nonce :email="email" @nonceEntered="nonceEntered" />
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
      this.$router.push({ path: 'change-password', query: { email, nonce } })
    },
  },
}
</script>
