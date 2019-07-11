<template>
  <ds-form v-model="formData" :schema="formSchema" @submit="handleSubmit">
    <template slot-scope="{ errors }">
      <ds-input
        id="oldPassword"
        model="oldPassword"
        type="password"
        autocomplete="off"
        :label="$t('settings.security.change-password.label-old-password')"
      />
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
        <ds-button :loading="loading" :disabled="errors" primary>
          {{ $t('settings.security.change-password.button') }}
        </ds-button>
      </ds-space>
    </template>
  </ds-form>
</template>

<script>
import gql from 'graphql-tag'
import PasswordStrength from './Strength'
import PasswordForm from '~/components/utils/PasswordFormHelper'

export default {
  name: 'ChangePassword',
  components: {
    PasswordStrength,
  },
  data() {
    const passwordForm = PasswordForm({ translate: this.$t })
    return {
      formData: {
        oldPassword: '',
        ...passwordForm.formData,
      },
      formSchema: {
        oldPassword: {
          type: 'string',
          required: true,
          message: this.$t('settings.security.change-password.message-old-password-required'),
        },
        ...passwordForm.formSchema,
      },
      loading: false,
      disabled: true,
    }
  },
  methods: {
    async handleSubmit(data) {
      this.loading = true
      const mutation = gql`
        mutation($oldPassword: String!, $password: String!) {
          changePassword(oldPassword: $oldPassword, newPassword: $password)
        }
      `
      const variables = this.formData

      try {
        const { data } = await this.$apollo.mutate({ mutation, variables })
        this.$store.commit('auth/SET_TOKEN', data.changePassword)
        this.$toast.success(this.$t('settings.security.change-password.success'))
        this.formData = {
          oldPassword: '',
          password: '',
          passwordConfirmation: '',
        }
      } catch (err) {
        this.$toast.error(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
