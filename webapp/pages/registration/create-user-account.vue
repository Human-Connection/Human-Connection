<template>
  <create-user-account @userCreated="handleUserCreated" :email="email" :nonce="nonce" />
</template>

<script>
import CreateUserAccount from '~/components/Registration/CreateUserAccount'
export default {
  data() {
    const { nonce = '', email = '' } = this.$route.query
    return { nonce, email }
  },
  components: {
    CreateUserAccount,
  },
  methods: {
    async handleUserCreated({email, password}) {
      try {
        await this.$store.dispatch('auth/login', { email, password })
        this.$toast.success('You are logged in!')
        this.$router.push('/')
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
