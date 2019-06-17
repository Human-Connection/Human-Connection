<template>
  <ds-container width="small">
    <ds-flex>
      <ds-flex-item :width="{ base: '100%' }" centered>
        <ds-space style="text-align: center;" margin-top="small" margin-bottom="xxx-small" centered>
          <password-reset @handleSubmitted="handleSubmitted" v-if="!submitted" />
          <verify-code v-else />
        </ds-space>
      </ds-flex-item>
    </ds-flex>
  </ds-container>
</template>

<script>
import PasswordReset from '~/components/PasswordReset/PasswordReset'
import VerifyCode from '~/components/PasswordReset/VerifyCode'

export default {
  layout: 'default',
  data() {
    return {
      submitted: false,
    }
  },
  components: {
    PasswordReset,
    VerifyCode,
  },
  methods: {
    handleSubmitted() {
      this.submitted = true
    },
  },
}
</script>
