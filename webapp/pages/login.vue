<template>
  <transition name="fade" appear>
    <login-form @success="handleSuccess" />
  </transition>
</template>

<script>
import LoginForm from '~/components/LoginForm/LoginForm.vue'
import { VERSION } from '~/constants/terms-and-conditions-version.js'

export default {
  layout: 'no-header',
  components: {
    LoginForm,
  },
  asyncData({ store, redirect }) {
    if (store.getters['auth/user'].termsAndConditionsAgreedVersion === VERSION) {
      redirect('/')
    }
  },
  methods: {
    handleSuccess() {
      this.$router.replace(this.$route.query.path || '/')
    },
  },
}
</script>
