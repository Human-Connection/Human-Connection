<template>
  <ds-card>
    <transition name="ds-transition-fade">
      <client-only>
        <sweetalert-icon :icon="sweetAlertIcon" />
      </client-only>
    </transition>
    <ds-space v-if="success">
      <ds-text bold align="center">
        {{ $t(`settings.email.change-successful`) }}
      </ds-text>
    </ds-space>
    <template v-else>
      <ds-text bold align="center">
        {{ $t(`settings.email.verification-error.message`) }}
      </ds-text>
      <ds-space class="message">
        <client-only>
          <ds-text>
            <ds-space margin-top="large" margin-bottom="small">
              {{ $t(`settings.email.verification-error.explanation`) }}
            </ds-space>
            <ds-list>
              <ds-list-item>
                {{ $t(`settings.email.verification-error.reason.invalid-nonce`) }}
              </ds-list-item>
              <ds-list-item>
                {{ $t(`settings.email.verification-error.reason.no-email-request`) }}
              </ds-list-item>
            </ds-list>
            {{ $t('settings.email.verification-error.support') }}
            <a href="mailto:support@human-connection.org">support@human-connection.org</a>
          </ds-text>
        </client-only>
      </ds-space>
    </template>
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

<style lang="scss" scoped>
.message {
  display: flex;
  justify-content: space-around;
}
</style>
