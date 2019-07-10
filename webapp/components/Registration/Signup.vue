<template>
  <ds-card class="signup">
    <ds-space margin="large">
      <ds-form
        v-if="!success && !error"
        @input="handleInput"
        @input-valid="handleInputValid"
        v-model="formData"
        :schema="formSchema"
        @submit="handleSubmit"
      >
        <h1>{{ $t('registration.signup.title') }}</h1>
        <ds-space v-if="token" margin-botton="large">
          <ds-text v-html="$t('registration.signup.form.invitation-code', { code: token })" />
        </ds-space>
        <ds-space margin-botton="large">
          <ds-text>
            {{ $t('registration.signup.form.description') }}
          </ds-text>
        </ds-space>
        <ds-input
          :placeholder="$t('login.email')"
          type="email"
          id="email"
          model="email"
          name="email"
          icon="envelope"
        />
        <ds-button
          :disabled="disabled"
          :loading="$apollo.loading"
          primary
          fullwidth
          name="submit"
          type="submit"
          icon="envelope"
        >
          {{ $t('registration.signup.form.submit') }}
        </ds-button>
      </ds-form>
      <div v-else>
        <template v-if="!error">
          <sweetalert-icon icon="info" />
          <ds-text align="center" v-html="submitMessage" />
        </template>
        <template v-else>
          <sweetalert-icon icon="error" />
          <ds-text align="center">
            {{ error.message }}
          </ds-text>
        </template>
      </div>
    </ds-space>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export const SignupMutation = gql`
  mutation($email: String!) {
    Signup(email: $email) {
      email
    }
  }
`
export const SignupByInvitationMutation = gql`
  mutation($email: String!, $token: String!) {
    SignupByInvitation(email: $email, token: $token) {
      email
    }
  }
`
export default {
  components: {
    SweetalertIcon,
  },
  props: {
    token: { type: String, default: null },
  },
  data() {
    return {
      formData: {
        email: '',
      },
      formSchema: {
        email: {
          type: 'email',
          required: true,
          message: this.$t('common.validations.email'),
        },
      },
      disabled: true,
      success: false,
      error: null,
    }
  },
  computed: {
    submitMessage() {
      const { email } = this.formData
      return this.$t('registration.signup.form.success', { email })
    },
  },
  methods: {
    handleInput() {
      this.disabled = true
    },
    handleInputValid() {
      this.disabled = false
    },
    async handleSubmit() {
      const mutation = this.token ? SignupByInvitationMutation : SignupMutation
      const { email } = this.formData
      const { token } = this

      try {
        await this.$apollo.mutate({ mutation, variables: { email, token } })
        this.success = true

        setTimeout(() => {
          this.$emit('handleSubmitted', { email })
        }, 3000)
      } catch (err) {
        const { message } = err
        const mapping = {
          'User account with this email already exists': 'email-exists',
          'Invitation code already used or does not exist': 'invalid-invitation-token',
        }
        for (const [pattern, key] of Object.entries(mapping)) {
          if (message.includes(pattern))
            this.error = { key, message: this.$t(`registration.signup.form.errors.${key}`) }
        }
        if (!this.error) {
          this.$toast.error(message)
        }
      }
    },
  },
}
</script>
