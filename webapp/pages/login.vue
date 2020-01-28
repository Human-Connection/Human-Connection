<template>
  <transition name="fade" appear>
    <login-form @success="handleSuccess" />
  </transition>
</template>

<script>
import LoginForm from '~/components/LoginForm/LoginForm.vue'
import { VERSION } from '~/constants/terms-and-conditions-version.js'
import { mapGetters } from 'vuex'

export default {
  layout: 'no-header',
  components: {
    LoginForm,
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
  },
  asyncData({ store, redirect }) {
    if (store.getters['auth/user'].termsAndConditionsAgreedVersion === VERSION) {
      redirect('/')
    }
  },
  methods: {
    handleSuccess() {
      this.$i18n.set(this.user.locale || 'en')
      this.$router.replace(this.$route.query.path || '/')
    },
  },
}
</script>
