<template>
  <ds-card class="verify-code">
    <ds-space margin="large">
      <ds-form v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <ds-input
          :placeholder="$t('verify-code.form.input')"
          model="token"
          name="token"
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
