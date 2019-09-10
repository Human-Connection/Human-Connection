<template>
  <ds-card class="verify-nonce">
    <ds-space margin="large">
      <ds-form
        v-model="formData"
        :schema="formSchema"
        @submit="handleSubmitVerify"
        @input="handleInput"
        @input-valid="handleInputValid"
      >
        <ds-input
          :placeholder="$t('verify-nonce.form.nonce')"
          model="nonce"
          name="nonce"
          id="nonce"
          icon="question-circle"
        />
        <ds-space margin-botton="large">
          <ds-text>
            {{ $t('verify-nonce.form.description') }}
          </ds-text>
        </ds-space>
        <ds-button :disabled="disabled" primary fullwidth name="submit" type="submit">
          {{ $t('verify-nonce.form.next') }}
        </ds-button>
      </ds-form>
    </ds-space>
  </ds-card>
</template>

<script>
export default {
  props: {
    email: { type: String, required: true },
  },
  data() {
    return {
      formData: {
        nonce: '',
      },
      formSchema: {
        nonce: {
          type: 'string',
          min: 6,
          max: 6,
          required: true,
          message: this.$t('common.validations.verification-nonce'),
        },
      },
      disabled: true,
    }
  },
  methods: {
    async handleInput() {
      this.disabled = true
    },
    async handleInputValid() {
      this.disabled = false
    },
    handleSubmitVerify() {
      const { nonce } = this.formData
      const email = this.email
      this.$emit('verification', { email, nonce })
    },
  },
}
</script>
