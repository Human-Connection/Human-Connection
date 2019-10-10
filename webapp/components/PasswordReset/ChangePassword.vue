<template>
  <ds-space margin-top="base" margin-bottom="xxx-small">
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
        <ds-space margin-top="base" margin-bottom="xxx-small">
          <ds-button :loading="$apollo.loading" :disabled="errors" primary>
            {{ $t('settings.security.change-password.button') }}
          </ds-button>
        </ds-space>
      </template>
    </ds-form>
    <ds-space v-else>
      <template v-if="changePasswordResult === 'success'">
        <transition name="ds-transition-fade">
          <sweetalert-icon icon="success" />
        </transition>
        <ds-text>
          {{ $t('components.password-reset.change-password.success') }}
        </ds-text>
      </template>
      <template v-else>
        <transition name="ds-transition-fade">
          <sweetalert-icon icon="error" />
        </transition>
        <ds-text>
          <p>
            {{ $t(`components.password-reset.change-password.error`) }}
          </p>
          <p>
            {{ $t('components.password-reset.change-password.help') }}
            <br />
            <a href="mailto:support@human-connection.org">support@human-connection.org</a>
          </p>
        </ds-text>
      </template>
      <slot></slot>
    </ds-space>
  </ds-space>
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
    nonce: { type: String, required: true },
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
        mutation($nonce: String!, $email: String!, $password: String!) {
          resetPassword(nonce: $nonce, email: $email, newPassword: $password)
        }
      `
      const { password } = this.formData
      const { email, nonce } = this
      const variables = { password, email, nonce }
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
