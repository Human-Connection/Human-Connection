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
            id="password"
            model="password"
            type="password"
            autocomplete="off"
            :label="$t('settings.security.change-password.label-new-password')"
          />
          <ds-input
            id="passwordConfirmation"
            model="passwordConfirmation"
            type="password"
            autocomplete="off"
            :label="$t('settings.security.change-password.label-new-password-confirm')"
          />
          <password-strength :password="formData.password" />
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
import PasswordForm from '~/components/utils/PasswordFormHelper'

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
    const passwordForm = PasswordForm({ translate: this.$t })
    return {
      formData: {
        ...passwordForm.formData,
      },
      formSchema: {
        ...passwordForm.formSchema,
      },
      disabled: true,
      changePasswordResult: null,
    }
  },
  methods: {
    async handleSubmitPassword() {
      const mutation = gql`
        mutation($code: String!, $email: String!, $password: String!) {
          resetPassword(code: $code, email: $email, newPassword: $password)
        }
      `
      const { password } = this.formData
      const { email, code } = this
      const variables = { password, email, code }
      try {
        const {
          data: { resetPassword },
        } = await this.$apollo.mutate({ mutation, variables })
        this.changePasswordResult = resetPassword ? 'success' : 'error'
        setTimeout(() => {
          this.$emit('passwordResetResponse', this.changePasswordResult)
        }, 3000)
        this.formData = {
          password: '',
          passwordConfirmation: '',
        }
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
