<template>
  <ds-card centered>
    <client-only>
      <transition name="ds-transition-fade">
        <sweetalert-icon :icon="sweetAlertIcon" />
      </transition>
    </client-only>
    <ds-text v-if="success">
      {{ $t(`settings.email.change-successful`) }}
    </ds-text>
    <ds-text v-else>
      {{ $t(`settings.email.change-error`) }}
      <br />
      {{ $t(`settings.email.change-error-help`) }}
    </ds-text>
  </ds-card>
</template>

<script>
import { VerifyEmailAddressMutation } from '~/graphql/EmailAddress.js'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export default {
  components: {
    SweetalertIcon,
  },
  computed: {
    sweetAlertIcon() {
      return this.success ? 'success' : 'error'
    },
  },
  created() {
    if (this.success) {
      setTimeout(() => {
        this.$router.replace({ name: 'settings-my-email-address' })
      }, 3000)
    }
  },
  async asyncData(context) {
    const {
      store,
      query,
      app: { apolloProvider },
    } = context
    const client = apolloProvider.defaultClient
    let success
    const { email = '', nonce = '' } = query
    const currentUser = store.getters['auth/user']

    try {
      const response = await client.mutate({
        mutation: VerifyEmailAddressMutation,
        variables: { email, nonce },
      })
      const {
        data: { VerifyEmailAddress },
      } = response
      success = true
      store.commit(
        'auth/SET_USER',
        { ...currentUser, email: VerifyEmailAddress.email },
        { root: true },
      )
    } catch (error) {
      success = false
    }

    return { success }
  },
}
</script>
