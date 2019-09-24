<template>
  <ds-card centered v-if="success">
    <transition name="ds-transition-fade">
      <sweetalert-icon icon="success" />
    </transition>
    <ds-text>
      {{ $t(`settings.email.change-successful`) }}
    </ds-text>
  </ds-card>
  <ds-form v-else v-model="form" :schema="formSchema" @submit="submit">
    <template slot-scope="{ errors }">
      <ds-card :header="$t('settings.email.name')">
        <ds-input
          id="email"
          model="email"
          icon="at"
          disabled
          :label="$t('settings.email.labelNewEmail')"
        />
        <ds-input
          id="nonce"
          model="nonce"
          icon="question-circle"
          :label="$t('settings.email.labelNonce')"
        />

        <template slot="footer">
          <ds-button class="submit-button" icon="check" :disabled="errors" type="submit" primary>
            {{ $t('actions.save') }}
          </ds-button>
        </template>
      </ds-card>
    </template>
  </ds-form>
</template>

<script>
import { VerifyEmailAddressMutation } from '~/graphql/EmailAddress.js'
import { SweetalertIcon } from 'vue-sweetalert-icons'
import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    SweetalertIcon,
  },
  data() {
    return {
      formSchema: {
        nonce: { type: 'string', required: true },
      },
      success: false,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    form: {
      get: function() {
        const { email = '', nonce = '' } = this.$route.query
        return { email, nonce }
      },
      set: function(formData) {
        this.formData = formData
      },
    },
  },
  methods: {
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
    }),
    async submit() {
      const { email, nonce } = this.formData
      try {
        const {
          data: { VerifyEmailAddress },
        } = await this.$apollo.mutate({
          mutation: VerifyEmailAddressMutation,
          variables: { email, nonce },
        })
        this.setCurrentUser({
          ...this.currentUser,
          email: VerifyEmailAddress.email,
        })
        this.$toast.success(this.$t('settings.email.change-successful'))
        this.success = true

        setTimeout(() => {
          this.$router.push('/settings/my-email-address')
        }, 3000)
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
