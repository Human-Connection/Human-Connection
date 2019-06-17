<template>
  <ds-card class="verify-code">
    <ds-space margin="large">
      <ds-form v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <ds-input
          :placeholder="$t('verify-code.form.input')"
          model="code"
          name="code"
          icon="question-circle"
        />
        <ds-space margin-botton="large">
          <ds-text>
            {{ $t('verify-code.form.description') }}
          </ds-text>
        </ds-space>
        <ds-button
          :disabled="disabled"
          :loading="$apollo.loading"
          primary
          fullwidth
          name="submit"
          type="submit"
        >
          {{ $t('verify-code.form.submit') }}
        </ds-button>
      </ds-form>
    </ds-space>
  </ds-card>
</template>

<script>
export default {
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
          message: this.$t('verify-code.form.validations.code'),
        },
      },
    }
  },
}
</script>
