<template>
  <ds-card centered v-if="success">
    <transition name="ds-transition-fade">
      <sweetalert-icon icon="info" />
    </transition>
    <ds-text v-html="submitMessage" />
  </ds-card>
  <ds-form v-else v-model="form" :schema="formSchema" @submit="submit">
    <template slot-scope="{ errors }">
      <ds-card :header="$t('settings.email.name')">
        <ds-input
          id="email"
          model="email"
          icon="envelope"
          :label="$t('settings.email.labelEmail')"
        />

        <template slot="footer">
          <ds-space class="backendErrors" v-if="backendErrors">
            <ds-text align="center" bold color="danger">{{ backendErrors.message }}</ds-text>
          </ds-space>
          <ds-button icon="check" :disabled="errors" type="submit" primary>
            {{ $t('actions.save') }}
          </ds-button>
        </template>
      </ds-card>
    </template>
  </ds-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { AddEmailAddressMutation } from '~/graphql/EmailAddress.js'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export default {
  components: {
    SweetalertIcon,
  },
  data() {
    return {
      backendErrors: null,
      success: false,
    }
  },
  computed: {
    submitMessage() {
      const { email } = this.formData
      return this.$t('settings.email.submitted', { email })
    },
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    form: {
      get: function() {
        const { email } = this.currentUser
        return { email }
      },
      set: function(formData) {
        this.formData = formData
      },
    },
    formSchema() {
      const { email } = this.currentUser
      const sameEmailValidationError = this.$t('settings.email.validation.same-email')
      return {
        email: [
          { type: 'email', required: true },
          {
            validator(rule, value, callback, source, options) {
              const errors = []
              if (email === value) {
                errors.push(sameEmailValidationError)
              }
              return errors
            },
          },
        ],
      }
    },
  },
  methods: {
    async submit() {
      const { email } = this.formData
      try {
        await this.$apollo.mutate({
          mutation: AddEmailAddressMutation,
          variables: { email },
        })
        this.$toast.success(this.$t('settings.email.success'))
        this.success = true

        setTimeout(() => {
          this.$router.push({
            path: 'my-email-address/enter-nonce',
            query: { email },
          })
        }, 3000)
      } catch (err) {
        if (err.message.includes('exists')) {
          // We cannot use form validation errors here, the backend does not
          // have a query to filter for email addresses. This is a privacy
          // consideration. We could implement a dedicated query to check that
          // but I think it's too much effort for this feature.
          this.backendErrors = { message: this.$t('registration.signup.form.errors.email-exists') }
          return
        }
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
