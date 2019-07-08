<template>
  <ds-card v-if="success" class="success">
    <ds-space>
      <sweetalert-icon icon="success" />
      <ds-text align="center" bold color="success">
        {{ $t('registration.create-user-account.success') }}
      </ds-text>
    </ds-space>
  </ds-card>
  <ds-form
    v-else
    class="create-user-account"
    v-model="formData"
    :schema="formSchema"
    @submit="submit"
  >
    <template slot-scope="{ errors }">
      <ds-card :header="$t('registration.create-user-account.title')">
        <ds-input
          id="name"
          model="name"
          icon="user"
          :label="$t('settings.data.labelName')"
          :placeholder="$t('settings.data.namePlaceholder')"
        />
        <ds-input
          id="bio"
          model="about"
          type="textarea"
          rows="3"
          :label="$t('settings.data.labelBio')"
          :placeholder="$t('settings.data.labelBio')"
        />
        <ds-input
          id="password"
          model="password"
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
        <password-strength :password="formData.password" />
        <template slot="footer">
          <ds-space class="errors" v-if="errors">
            <ds-text align="center" bold color="danger">
              {{ errors.message }}
            </ds-text>
          </ds-space>
          <ds-button
            style="float: right;"
            icon="check"
            type="submit"
            :loading="$apollo.loading"
            :disabled="errors"
            primary
          >
            {{ $t('actions.save') }}
          </ds-button>
        </template>
      </ds-card>
    </template>
  </ds-form>
</template>

<script>
import gql from 'graphql-tag'
import PasswordStrength from '../Password/Strength'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export const SignupVerificationMutation = gql`
  mutation($nonce: String!, $name: String!, $email: String!, $password: String!) {
    SignupVerification(nonce: $nonce, email: $email, name: $name, password: $password) {
      id
      name
      slug
    }
  }
`
export default {
  components: {
    PasswordStrength,
    SweetalertIcon,
  },
  data() {
    return {
      formData: {
        name: '',
        about: '',
        password: '',
        confirmPassword: '',
      },
      formSchema: {
        name: {
          type: 'string',
          required: true,
          min: 3,
        },
        about: {
          type: 'string',
          required: false,
        },
        password: {
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
      success: null,
      errors: null,
    }
  },
  props: {
    nonce: { type: String, required: true },
    email: { type: String, required: true },
  },
  methods: {
    async submit() {
      const { name, password, about } = this.formData
      const { email, nonce } = this
      try {
        await this.$apollo.mutate({
          mutation: SignupVerificationMutation,
          variables: { name, password, about, email, nonce },
        })
        this.success = true
        setTimeout(() => {
          this.$emit('userCreated', {
            email,
            password,
          })
        }, 3000)
      } catch (err) {
        this.errors = err
      }
    },
    matchPassword(rule, value, callback, source, options) {
      var errors = []
      if (this.formData.password !== value) {
        errors.push(
          new Error(this.$t('settings.security.change-password.message-new-password-missmatch')),
        )
      }
      callback(errors)
    },
  },
}
</script>
