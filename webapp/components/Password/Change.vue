<template>
  <ds-form v-model="formData" :schema="formSchema" @submit="handleSubmit" @input="handleInput">
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
      <!--<password-strength :password="newPassword" @change="e => passwordSecure = e.isSecure"/>-->
      <ds-space margin-top="base">
        <ds-button
          :loading="loading"
          :disabled="disabled"
          primary
        >{{ $t('settings.security.change-password.button') }}</ds-button>
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
    PasswordStrength
  },
  data() {
    return {
      formData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      formSchema: {
        oldPassword: { required: true },
        newPassword: { required: true },
        confirmPassword: { required: true }
      },
      loading: false,
      disabled: true
    }
  },
  methods: {
    async handleInput(data) {
      //return 'abcabc1234567!' // this.formData.newPassword
      console.log('validation')
      console.log(data)
      if (
        this.formData.newPassword &&
        this.formData.newPassword === this.formData.confirmPassword
      ) {
        this.disabled = false
      } else {
        this.disabled = true
      }
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
        this.$toast.success(
          this.$t('settings.security.change-password.success')
        )
      } catch (err) {
        this.$toast.error(err.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
