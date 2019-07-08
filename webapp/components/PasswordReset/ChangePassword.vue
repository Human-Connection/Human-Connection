<template>
  <ds-card class="verify-code">
    <ds-space margin="large">
      <ds-form
        v-if="!changePasswordResult"
        v-model="formData"
        :schema="formSchema"
        @submit="handleSubmitPassword"
        class="change-password"
      >
        <template slot-scope="{ errors }">
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
          <password-strength :password="formData.newPassword" />
          <ds-space margin-top="base">
            <ds-button :loading="$apollo.loading" :disabled="errors" primary>
              {{ $t('settings.security.change-password.button') }}
            </ds-button>
          </ds-space>
        </template>
      </ds-form>
      <ds-text v-else>
        <template v-if="changePasswordResult === 'success'">
          <sweetalert-icon icon="success" />
          <ds-text>
            {{ $t(`verify-code.form.change-password.success`) }}
          </ds-text>
        </template>
        <template v-else>
          <sweetalert-icon icon="error" />
          <ds-text align="left">
            {{ $t(`verify-code.form.change-password.error`) }}
            {{ $t('verify-code.form.change-password.help') }}
          </ds-text>
          <a href="mailto:support@human-connection.org">support@human-connection.org</a>
        </template>
      </ds-text>
    </ds-space>
  </ds-card>
</template>

<script>
import PasswordStrength from '../Password/Strength'
import gql from 'graphql-tag'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export default {
  components: {
    SweetalertIcon,
    PasswordStrength,
  },
  props: {
    email: { type: String, required: true },
    code: { type: String, required: true },
  },
  data() {
    return {
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
      disabled: true,
      changePasswordResult: null,
    }
  },
  methods: {
    async handleSubmitPassword() {
      const mutation = gql`
        mutation($code: String!, $email: String!, $newPassword: String!) {
          resetPassword(code: $code, email: $email, newPassword: $newPassword)
        }
      `
      const { newPassword } = this.formData
      const { email, code } = this
      const variables = { newPassword, email, code }
      try {
        const {
          data: { resetPassword },
        } = await this.$apollo.mutate({ mutation, variables })
        this.changePasswordResult = resetPassword ? 'success' : 'error'
        setTimeout(() => {
          this.$emit('passwordResetResponse', this.changePasswordResult)
        }, 3000)
        this.formData = {
          newPassword: '',
          confirmPassword: '',
        }
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    matchPassword(rule, value, callback, source, options) {
      var errors = []
      if (this.formData.newPassword !== value) {
        errors.push(
          new Error(this.$t('settings.security.change-password.message-new-password-missmatch')),
        )
      }
      callback(errors)
    },
  },
}
</script>
