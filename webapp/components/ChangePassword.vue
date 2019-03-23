<template>
  <ds-form
    v-model="formData"
    :schema="formSchema"
    @submit="handleSubmit"
  >
    <template>
      <ds-input
        id="oldPassword"
        model="oldPassword"
        type="password"
        label="Your old password"
      />
      <ds-input
        id="newPassword"
        model="newPassword"
        type="password"
        label="Your new password"
      />
      <ds-input
        id="confirmPassword"
        model="confirmPassword"
        type="password"
        label="Confirm new password"
      />
      <ds-space margin-top="base">
        <ds-button
          :loading="loading"
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

export default {
  name: 'ChangePassword',
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
