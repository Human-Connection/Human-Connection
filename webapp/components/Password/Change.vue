<template>
  <ds-form
    v-model="formData"
    :schema="formSchema"
    @submit="handleSubmit"
    @input="handleInput"
    @input-valid="handleInputValid"
  >
    <template>
      <ds-input
        id="oldPassword"
        model="oldPassword"
        type="password"
        :label="$t('settings.security.change-password.label-old-password')"
      />
      <ds-input
        id="newPassword"
        model="newPassword"
        type="password"
        :label="$t('settings.security.change-password.label-new-password')"
      />
      <ds-input
        id="confirmPassword"
        model="confirmPassword"
        type="password"
        :label="$t('settings.security.change-password.label-new-password-confirm')"
      />
      <password-strength :password="formData.newPassword" />
      <ds-space margin-top="base">
        <ds-button
:loading="loading" :disabled="disabled"
primary
>
          {{ $t('settings.security.change-password.button') }}
        </ds-button>
      </ds-space>
    </template>
  </ds-form>
</template>

<script>
import gql from 'graphql-tag'
import PasswordStrength from './Strength'

export default {
  name: 'ChangePassword',
  components: {
    PasswordStrength,
  },
  data() {
    return {
      formData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      formSchema: {
        oldPassword: {
          type: 'string',
          required: true,
          message: this.$t('settings.security.change-password.message-old-password-required'),
        },
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
      loading: false,
      disabled: true,
    }
  },
  methods: {
    async handleInput(data) {
      this.disabled = true
    },
    async handleInputValid(data) {
      this.disabled = false
    },
    async handleSubmit(data) {
      this.loading = true
      const mutation = gql`
        mutation($oldPassword: String!, $newPassword: String!) {
          changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
        }
      `
      const variables = this.formData

      try {
        const { data } = await this.$apollo.mutate({ mutation, variables })
        this.$store.commit('auth/SET_TOKEN', data.changePassword)
        this.$toast.success(this.$t('settings.security.change-password.success'))
        this.formData = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }
      } catch (err) {
        this.$toast.error(err.message)
      } finally {
        this.loading = false
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
