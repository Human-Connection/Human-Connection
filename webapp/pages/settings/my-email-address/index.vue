<template>
  <base-card v-if="data">
    <transition name="ds-transition-fade">
      <sweetalert-icon icon="info" />
    </transition>
    <ds-text v-html="submitMessage" />
  </base-card>
  <ds-form v-else v-model="form" :schema="formSchema" @submit="submit">
    <template #default="{ errors }">
      <base-card>
        <h2 class="title">{{ $t('settings.email.name') }}</h2>
        <ds-input
          id="email"
          model="email"
          icon="envelope"
          :label="$t('settings.email.labelEmail')"
        />
        <ds-space class="backendErrors" v-if="backendErrors">
          <ds-text align="center" bold color="danger">{{ backendErrors.message }}</ds-text>
        </ds-space>
        <base-button icon="check" :disabled="errors" type="submit" filled>
          {{ $t('actions.save') }}
        </base-button>
      </base-card>
    </template>
  </ds-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { AddEmailAddressMutation } from '~/graphql/EmailAddress.js'
import { SweetalertIcon } from 'vue-sweetalert-icons'
import normalizeEmail from '~/components/utils/NormalizeEmail'

export default {
  components: {
    SweetalertIcon,
  },
  data() {
    return {
      backendErrors: null,
      data: null,
    }
  },
  computed: {
    submitMessage() {
      const { email } = this.data.AddEmailAddress
      return this.$t('settings.email.submitted', { email })
    },
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    form: {
      get: function () {
        const { email } = this.currentUser
        return { email }
      },
      set: function (formData) {
        this.formData = formData
      },
    },
    formSchema() {
      const currentEmail = normalizeEmail(this.currentUser.email)
      const sameEmailValidationError = this.$t('settings.email.validation.same-email')
      return {
        email: [
          { type: 'email', required: true },
          {
            validator(rule, value, callback, source, options) {
              const errors = []
              if (currentEmail === normalizeEmail(value)) {
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
        const response = await this.$apollo.mutate({
          mutation: AddEmailAddressMutation,
          variables: { email },
        })
        this.data = response.data
        this.$toast.success(this.$t('settings.email.success'))

        setTimeout(() => {
          this.$router.push({
            path: 'my-email-address/enter-nonce',
            query: { email: this.data.AddEmailAddress.email },
          })
        }, 3000)
      } catch (err) {
        if (err.message.includes('exists')) {
          // We cannot use form validation errors here, the backend does not
          // have a query to filter for email addresses. This is a privacy
          // consideration. We could implement a dedicated query to check that
          // but I think it's too much effort for this feature.
          this.backendErrors = {
            message: this.$t('components.registration.signup.form.errors.email-exists'),
          }
          return
        }
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
