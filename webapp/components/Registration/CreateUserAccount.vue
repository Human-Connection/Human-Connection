<template>
  <ds-container width="small">
    <ds-card v-if="success" class="success">
      <ds-space>
        <sweetalert-icon icon="success" />
        <ds-text
          align="center"
          bold
          color="success"
        >{{ $t('registration.create-user-account.success') }}</ds-text>
      </ds-space>
    </ds-card>
    <ds-form
      v-else
      class="create-user-account"
      v-model="formData"
      :schema="formSchema"
      @submit="submit"
    >
      <template>
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
          <div v-on:click="checkedConfimed = false">
            <ds-input
              id="passwordConfirmation"
              model="passwordConfirmation"
              type="password"
              autocomplete="off"
              :label="$t('settings.security.change-password.label-new-password-confirm')"
            />
          </div>
          <password-strength :password="formData.password" />

          <ds-text>
            <input id="checkbox" type="checkbox" v-model="checkedConfimed" @change="checked" />
            <label for="checkbox" v-html="$t('site.termsAndConditionsRead')"></label>
          </ds-text>

          <template slot="footer">
            <ds-space class="backendErrors" v-if="backendErrors">
              <ds-text align="center" bold color="danger">{{ backendErrors.message }}</ds-text>
            </ds-space>
            <ds-button
              style="float: right;"
              icon="check"
              type="submit"
              :loading="$apollo.loading"
              :disabled="!checkedConfimed"
              primary
            >{{ $t('actions.save') }}</ds-button>
          </template>
        </ds-card>
      </template>
    </ds-form>
  </ds-container>
</template>

<script>
import gql from 'graphql-tag'
import PasswordStrength from '../Password/Strength'
import PasswordForm from '~/components/utils/PasswordFormHelper'
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
  },
  data() {
    const passwordForm = PasswordForm({ translate: this.$t })
    return {
      formData: {
        name: '',
        about: '',
        ...passwordForm.formData,
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
        ...passwordForm.formSchema,
      },
      errors: true,
      success: null,
      backendErrors: null,
      checkedConfimed: false,
    }
  },
  props: {
    nonce: { type: String, required: true },
    email: { type: String, required: true },
  },
  methods: {
    checked: function() {
      const { password, passwordConfirmation } = this.formData
      if (this.checkedConfimed && passwordConfirmation !== '') {
        if (passwordConfirmation === password) {
          this.checkedConfimed = true
        } else {
          this.checkedConfimed = false
          this.backendErrors = { message: 'Prüfe bitte deine Passwörter' }
        }
        this.backendErrors = { message: null }
      } else {
        this.checkedConfimed = false
      }
    },
    async submit() {
      if (this.checkedConfimed) {
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
          this.backendErrors = err
        }
      } else {
        this.backendErrors = { message: this.$t(`site.confirmTermsAndConditions`) }
      }
    },
  },
}
</script>
