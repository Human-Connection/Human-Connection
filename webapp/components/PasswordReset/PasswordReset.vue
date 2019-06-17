<template>
  <ds-card class="password-reset">
    <ds-space margin="large">
      <ds-form
        v-if="!submitted"
        @input="handleInput"
        @input-valid="handleInputValid"
        v-model="formData"
        :schema="formSchema"
        @submit="handleSubmit"
        >
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
            :loading="$apollo.loading"
            primary
            fullwidth
            name="submit"
            type="submit"
            icon="envelope"
            >
            {{ $t('password-reset.form.submit') }}
          </ds-button>
      </ds-form>
      <div v-else>
        <transition name="ds-transition-fade">
        <ds-flex centered>
          <sweetalert-icon icon="success" />
        </ds-flex>
        </transition>
        <ds-text v-html="submitMessage" />
      </div>
    </ds-space>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export default {
  components: {
    SweetalertIcon,
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
      submitted: false,
    }
  },
  computed: {
    submitMessage() {
      const { email } = this.formData
      return this.$t('password-reset.form.submitted', { email })
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
      const mutation = gql`
        mutation($email: String!) {
          requestPasswordReset(email: $email)
        }
      `
      const variables = this.formData

      try {
        await this.$apollo.mutate({ mutation, variables })
        this.submitted = true

        setTimeout(() => {
          this.$emit('submitted')
        }, 1000)
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
