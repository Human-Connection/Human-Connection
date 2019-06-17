<template>
  <ds-container width="small">
    <ds-flex>
      <ds-flex-item :width="{ base: '100%' }" centered>
        <ds-space style="text-align: center;" margin-top="small" margin-bottom="xxx-small" centered>
          <ds-card class="password-reset-card">
            <ds-space margin="large">
              <ds-form
                @input="handleInput"
                @input-valid="handleInputValid"
                v-model="formData"
                :schema="formSchema"
                @submit="handleSubmit">
                <ds-input
                  :placeholder="$t('login.email')"
                  type="email"
                  id="email"
                  model="email"
                  name="email"
                  icon="envelope"
                />
                <ds-space margin-botton="large">
                  <ds-text>
                    {{ $t('password-reset.form.description') }}
                  </ds-text>
                </ds-space>
                <ds-button
                  :disabled="disabled"
                  :loading="$apollo.loading" primary fullwidth name="submit" type="submit" icon="envelope">
                  {{ $t('password-reset.form.submit') }}
                </ds-button>
              </ds-form>
            </ds-space>
          </ds-card>
        </ds-space>
      </ds-flex-item>
    </ds-flex>
  </ds-container>
</template>

<script>
import gql from 'graphql-tag'

export default {
  layout: 'default',
  data() {
    return {
      formData: {
        email: ''
      },
      formSchema: {
        email: {
          type: 'email',
          required: true,
          message: this.$t('common.validations.email'),
        }
      },
      disabled: true,
    }
  },
  methods: {
    handleInput(data) {
      this.disabled = true
    },
    handleInputValid(data) {
      this.disabled = false
    },
    async handleSubmit() {
      console.log('handleSubmit')
      const mutation = gql`
        mutation($email: String!) {
          requestPasswordReset(email: $email)
        }
      `
      const variables = this.formData

      try {
        const { data } = await this.$apollo.mutate({ mutation, variables })
        this.$toast.success(this.$t('password-reset.form.submitted'))
        this.formData = {
          email: '',
        }
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  },
}
</script>
