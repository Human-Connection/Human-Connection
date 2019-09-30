<template>
  <ds-container width="small">
    <ds-card v-if="success" class="success">
      <ds-space>
        <sweetalert-icon icon="success" />
        <ds-text align="center" bold color="success">
          {{ $t('registration.create-user-account.success') }}
        </ds-text>
      </ds-space>
    </ds-card>
    <ds-card v-else class="create-account-card">
      <client-only>
        <locale-switch />
      </client-only>
      <ds-space centered>
        <img
          class="create-account-image"
          alt="Create an account for Human Connection"
          src="/img/sign-up/nicetomeetyou.svg"
        />
      </ds-space>
      <ds-space>
        <ds-heading size="h3">
          {{ $t('registration.create-user-account.title') }}
        </ds-heading>
      </ds-space>

      <ds-form class="create-user-account" v-model="formData" :schema="formSchema" @submit="submit">
        <template v-slot="{ errors }">
          <ds-flex gutter="base">
            <ds-flex-item width="100%">
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
                  id="checkbox"
                  type="checkbox"
                  v-model="termsAndConditionsConfirmed"
                  :checked="termsAndConditionsConfirmed"
                />
                <label
                  for="checkbox"
                  v-html="$t('termsAndConditions.termsAndConditionsConfirmed')"
                ></label>
              </ds-text>
            </ds-flex-item>
            <ds-flex-item width="100%">
              <ds-space class="backendErrors" v-if="backendErrors">
                <ds-text align="center" bold color="danger">{{ backendErrors.message }}</ds-text>
              </ds-space>
              <ds-button
                style="float: right;"
                icon="check"
                type="submit"
                :loading="$apollo.loading"
                :disabled="errors || !termsAndConditionsConfirmed"
                primary
              >
                {{ $t('actions.save') }}
              </ds-button>
            </ds-flex-item>
          </ds-flex>
        </template>
      </ds-form>
    </ds-card>
  </ds-container>
</template>

<script>
import PasswordStrength from '../Password/Strength'
import { SweetalertIcon } from 'vue-sweetalert-icons'
import PasswordForm from '~/components/utils/PasswordFormHelper'
import { VERSION } from '~/constants/terms-and-conditions-version.js'
import { SignupVerificationMutation } from '~/graphql/Registration.js'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'

export default {
  components: {
    PasswordStrength,
    SweetalertIcon,
    LocaleSwitch,
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
      disabled: true,
      success: null,
      backendErrors: null,
      // TODO: Our styleguide does not support checkmarks.
      // Integrate termsAndConditionsConfirmed into `this.formData` once we
      // have checkmarks available.
      termsAndConditionsConfirmed: false,
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
