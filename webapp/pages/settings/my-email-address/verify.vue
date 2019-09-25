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
      query,
      app: { apolloProvider },
    } = context
    const client = apolloProvider.defaultClient
    let success
    const { email = '', nonce = '' } = query

    try {
      await client.mutate({
        mutation: VerifyEmailAddressMutation,
        variables: { email, nonce },
      })
      success = true
    } catch (error) {
      success = false
    }

    return { success }
  },
}
</script>
