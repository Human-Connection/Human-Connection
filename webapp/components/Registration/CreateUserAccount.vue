<template>
  <div v-if="response === 'success'">
    <transition name="ds-transition-fade">
      <sweetalert-icon icon="success" />
    </transition>
    <ds-text align="center" bold color="success">
      {{ $t('components.registration.create-user-account.success') }}
    </ds-text>
  </div>
  <div v-else-if="response === 'error'">
    <transition name="ds-transition-fade">
      <sweetalert-icon icon="error" />
    </transition>
    <ds-text align="center" bold color="danger">
      {{ $t('components.registration.create-user-account.error') }}
    </ds-text>
    <ds-text align="center">
      {{ $t('components.registration.create-user-account.help') }}
      <a :href="supportEmail.href">{{ supportEmail.label }}</a>
    </ds-text>
    <ds-space centered>
      <nuxt-link to="/login">{{ $t('site.back-to-login') }}</nuxt-link>
    </ds-space>
  </div>
  <div v-else class="create-account-card">
    <ds-space margin-top="large">
      <ds-heading size="h3">
        {{ $t('components.registration.create-user-account.title') }}
      </ds-heading>
    </ds-space>

    <ds-form class="create-user-account" v-model="formData" :schema="formSchema" @submit="submit">
      <template v-slot="{ errors }">
        <ds-input
          id="name"
          model="name"
          icon="user"
          :label="$t('settings.data.labelName')"
          :placeholder="$t('settings.data.namePlaceholder')"
        />
        <ds-input
          id="about"
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
          id="passwordConfirmation"
          model="passwordConfirmation"
          type="password"
          autocomplete="off"
          :label="$t('settings.security.change-password.label-new-password-confirm')"
        />
        <password-strength :password="formData.password" />

        <ds-text>
          <input
            id="checkbox0"
            type="checkbox"
            v-model="termsAndConditionsConfirmed"
            :checked="termsAndConditionsConfirmed"
          />
          <label
            for="checkbox"
            v-html="$t('termsAndConditions.termsAndConditionsConfirmed')"
          ></label>
        </ds-text>
        <p>
          <label>
            <input id="checkbox1" type="checkbox" v-model="dataPrivacy" :checked="dataPrivacy" />
            <span v-html="$t('components.registration.signup.form.data-privacy')"></span>
          </label>
        </p>
        <p>
          <label>
            <input id="checkbox2" type="checkbox" v-model="minimumAge" :checked="minimumAge" />
            <span v-html="$t('components.registration.signup.form.minimum-age')"></span>
          </label>
        </p>
        <ds-button
          style="float: right;"
          icon="check"
          type="submit"
          :loading="$apollo.loading"
          :disabled="errors || !termsAndConditionsConfirmed || !dataPrivacy || !minimumAge"
          primary
        >
          {{ $t('actions.save') }}
        </ds-button>
      </template>
    </ds-form>
  </div>
</template>

<script>
import PasswordStrength from '../Password/Strength'
import { SweetalertIcon } from 'vue-sweetalert-icons'
import PasswordForm from '~/components/utils/PasswordFormHelper'
import { SUPPORT_EMAIL } from '~/constants/emails.js'
import { VERSION } from '~/constants/terms-and-conditions-version.js'
import { SignupVerificationMutation } from '~/graphql/Registration.js'

export default {
  components: {
    PasswordStrength,
    SweetalertIcon,
  },
  data() {
    const passwordForm = PasswordForm({ translate: this.$t })
    return {
      supportEmail: SUPPORT_EMAIL,
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
      disabled: true,
      response: null,
      // TODO: Our styleguide does not support checkmarks.
      // Integrate termsAndConditionsConfirmed into `this.formData` once we
      // have checkmarks available.
      termsAndConditionsConfirmed: false,
      dataPrivacy: false,
      minimumAge: false,
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
      const termsAndConditionsAgreedVersion = VERSION
      try {
        await this.$apollo.mutate({
          mutation: SignupVerificationMutation,
          variables: { name, password, about, email, nonce, termsAndConditionsAgreedVersion },
        })
        this.response = 'success'
        setTimeout(() => {
          this.$emit('userCreated', {
            email,
            password,
          })
        }, 3000)
      } catch (err) {
        this.response = 'error'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.create-account-image {
  width: 50%;
  max-width: 200px;
}
</style>
