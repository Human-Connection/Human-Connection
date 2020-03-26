<template>
  <ds-form v-model="form" :schema="formSchema" @submit="submit">
    <template #default="{ errors }">
      <base-card>
        <h2 class="title">{{ $t('settings.email.name') }}</h2>
        <ds-input
          id="email"
          model="email"
          icon="envelope"
          disabled
          :label="$t('settings.email.labelNewEmail')"
        />
        <ds-input
          id="nonce"
          model="nonce"
          icon="question-circle"
          :label="$t('settings.email.labelNonce')"
        />
        <base-button icon="check" :disabled="errors" type="submit" filled>
          {{ $t('actions.save') }}
        </base-button>
      </base-card>
    </template>
  </ds-form>
</template>

<script>
export default {
  data() {
    return {
      formSchema: {
        nonce: { type: 'string', required: true },
      },
    }
  },
  computed: {
    form: {
      get: function () {
        const { email = '', nonce = '' } = this.$route.query
        return { email, nonce }
      },
      set: function (formData) {
        this.formData = formData
      },
    },
  },
  methods: {
    async submit() {
      const { email, nonce } = this.formData
      this.$router.replace({
        path: 'verify',
        query: { email, nonce },
      })
    },
  },
}
</script>
