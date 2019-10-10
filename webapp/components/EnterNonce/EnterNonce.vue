<template>
  <ds-space margin-top="large" margin-bottom="xxx-small">
    <ds-form
      v-model="formData"
      :schema="formSchema"
      @submit="handleSubmitVerify"
      @input="handleInput"
      @input-valid="handleInputValid"
    >
      <ds-input
        :placeholder="$t('components.enter-nonce.form.nonce')"
        model="nonce"
        name="nonce"
        id="nonce"
        icon="question-circle"
      />
      <ds-space margin-botton="large">
        <ds-text>
          {{ $t('components.enter-nonce.form.description') }}
        </ds-text>
      </ds-space>
      <ds-button :disabled="disabled" primary fullwidth name="submit" type="submit">
        {{ $t('components.enter-nonce.form.next') }}
      </ds-button>
    </ds-form>
    <slot></slot>
  </ds-space>
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
          message: this.$t('components.enter-nonce.form.validations.length'),
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
      this.$emit('nonceEntered', { email, nonce })
    },
  },
}
</script>
