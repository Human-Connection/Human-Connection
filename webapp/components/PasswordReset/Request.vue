<template>
  <ds-card class="password-reset">
    <ds-flex gutter="small">
      <ds-flex-item :width="{ base: '100%', sm: '50%' }" centered>
        <client-only>
          <locale-switch class="login-locale-switch" offset="5" />
        </client-only>
        <ds-space margin-top="small" margin-bottom="xxx-small" centered>
          <img class="login-image" alt="Human Connection" src="/img/sign-up/humanconnection.svg" />
        </ds-space>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '100%', sm: '50%' }" centered>
        <ds-space margin="small">
          <ds-text size="small" align="left">{{ $t('login.copy') }}</ds-text>
        </ds-space>
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
            <ds-text align="left">{{ $t('password-reset.form.description') }}</ds-text>
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
              <sweetalert-icon icon="info" />
            </ds-flex>
          </transition>
          <ds-text v-html="submitMessage" align="left" />
        </div>
        <ds-space margin-bottom="small" />
        <div>
          <nuxt-link to="/login">{{ $t('site.login') }}</nuxt-link>
        </div>
      </ds-flex-item>
    </ds-flex>

    <ds-space margin="x-small"></ds-space>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import { SweetalertIcon } from 'vue-sweetalert-icons'
import LocaleSwitch from '../LocaleSwitch/LocaleSwitch'

export default {
  components: {
    SweetalertIcon,
    LocaleSwitch,
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
      const { email } = this.formData

      try {
        await this.$apollo.mutate({ mutation, variables: { email } })
        this.submitted = true

        setTimeout(() => {
          this.$emit('handleSubmitted', { email })
        }, 3000)
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
<style>
.login-image {
  width: 90%;
  max-width: 200px;
}
.password-reset {
  position: relative;
}
.login-locale-switch {
  position: absolute;
  top: 1em;
  left: 1em;
}
</style>
