<template>
  <ds-card class="verify-code">
    <ds-space margin="large">
      <ds-form
        v-if="!verificationSubmitted"
        v-model="verification.formData"
        :schema="verification.formSchema"
        @submit="handleSubmitVerify"
        @input="handleInput"
        @input-valid="handleInputValid"
      >
        <ds-input
          :placeholder="$t('login.email')"
          model="email"
          id="email"
          name="email"
          icon="envelope"
        />
        <ds-input
          :placeholder="$t('verify-code.form.code')"
          model="code"
          name="code"
          id="code"
          icon="question-circle"
        />
        <ds-space margin-botton="large">
          <ds-text>
            {{ $t('verify-code.form.description') }}
          </ds-text>
        </ds-space>
        <ds-button :disabled="disabled" primary fullwidth name="submit" type="submit">
          {{ $t('verify-code.form.submit') }}
        </ds-button>
      </ds-form>
      <template v-else>
        <ds-form
          v-if="!changePasswordResult"
          v-model="password.formData"
          :schema="password.formSchema"
          @submit="handleSubmitPassword"
          @input="handleInput"
          @input-valid="handleInputValid"
          class="change-password"
        >
          <ds-input
            id="newPassword"
            model="newPassword"
            type="password"
            autocomplete="off"
            :label="$t('settings.security.change-password.label-new-password')"
          />
          <ds-input
            id="confirmPassword"
            model="confirmPassword"
            type="password"
            autocomplete="off"
            :label="$t('settings.security.change-password.label-new-password-confirm')"
          />
          <password-strength :password="password.formData.newPassword" />
          <ds-space margin-top="base">
            <ds-button :loading="$apollo.loading" :disabled="disabled" primary>
              {{ $t('settings.security.change-password.button') }}
            </ds-button>
          </ds-space>
        </ds-form>
        <ds-text v-else>
          {{ changePasswordResultMessage }}
        </ds-text>
      </template>
    </ds-space>
  </ds-card>
</template>

<script>
import PasswordStrength from '../Password/Strength'
import gql from 'graphql-tag'

export default {
  components: {
    PasswordStrength,
  },
  data() {
    return {
      verification: {
        formData: {
          email: '',
          code: '',
        },
        formSchema: {
          email: {
            type: 'email',
            required: true,
            message: this.$t('common.validations.email'),
          },
          code: {
            type: 'string',
            min: 6,
            max: 6,
            required: true,
            message: this.$t('common.validations.verification-code'),
          },
        },
      },
      password: {
        formData: {
          newPassword: '',
          confirmPassword: '',
        },
        formSchema: {
          newPassword: {
            type: 'string',
            required: true,
            message: this.$t('settings.security.change-password.message-new-password-required'),
          },
          confirmPassword: [
            { validator: this.matchPassword },
            {
              type: 'string',
              required: true,
              message: this.$t(
                'settings.security.change-password.message-new-password-confirm-required',
              ),
            },
          ],
        },
      },
      verificationSubmitted: false,
      disabled: true,
      changePasswordResult: null,
    }
  },
  computed: {
    changePasswordResultMessage() {
      if (!this.changePasswordResult) return ''
      return this.$t(`verify-code.form.change-password.${this.changePasswordResult}`)
    },
  },
  methods: {
    async handleInput() {
      this.disabled = true
    },
    async handleInputValid() {
      this.disabled = false
    },
    handleSubmitVerify() {
      this.verificationSubmitted = true
    },
    async handleSubmitPassword() {
      const mutation = gql`
        mutation($token: String!, $email: String!, $newPassword: String!) {
          resetPassword(token: $token, email: $email, newPassword: $newPassword)
        }
      `
      const { newPassword } = this.password.formData
      const { email, code: token } = this.verification.formData
      const variables = { newPassword, email, token }
      try {
        const {
          data: { resetPassword },
        } = await this.$apollo.mutate({ mutation, variables })
        const changePasswordResult = resetPassword ? 'success' : 'failure'
        this.changePasswordResult = changePasswordResult
        this.$emit('change-password-result', changePasswordResult)
        this.verification.formData = {
          code: '',
          email: '',
        }
        this.password.formData = {
          newPassword: '',
          confirmPassword: '',
        }
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    matchPassword(rule, value, callback, source, options) {
      var errors = []
      if (this.password.formData.newPassword !== value) {
        errors.push(
          new Error(this.$t('settings.security.change-password.message-new-password-missmatch')),
        )
      }
      callback(errors)
    },
  },
}
</script>
