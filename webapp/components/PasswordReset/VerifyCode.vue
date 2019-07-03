<template>
  <ds-card class="verify-code">
    <ds-space margin="large">
      <ds-form
        v-model="formData"
        :schema="formSchema"
        @submit="handleSubmitVerify"
        @input="handleInput"
        @input-valid="handleInputValid"
      >
        <ds-input
          :placeholder="$t('verify-code.form.code')"
          model="code"
          name="code"
          id="code"
          icon="question-circle"
        />
        <ds-space margin-botton="large">
          <ds-text>
            {{ $t('verify-code.form.description') }}
          </ds-text>
        </ds-space>
        <ds-button :disabled="disabled" primary fullwidth name="submit" type="submit">
          {{ $t('verify-code.form.next') }}
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
        code: '',
      },
      formSchema: {
        code: {
          type: 'string',
          min: 6,
          max: 6,
          required: true,
          message: this.$t('common.validations.verification-code'),
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
      const { code } = this.formData
      const email = this.email
      this.$emit('verification', { email, code })
    },
  },
}
</script>
