<template>
  <ds-container width="small">
    <ds-flex>
      <ds-flex-item :width="{ base: '100%' }" centered>
        <ds-space style="text-align: center;" margin-top="small" margin-bottom="xxx-small" centered>
          <password-reset @handleSubmitted="handlePasswordResetRequested" v-if="!passwordResetRequested" />
          <verify-code v-else @passwordResetResponse="handlePasswordResetResponse" />
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
      passwordResetRequested: false
    }
  },
  components: {
    PasswordReset,
    VerifyCode,
  },
  methods: {
    handlePasswordResetRequested() {
      this.passwordResetRequested = true
    },
    handlePasswordResetResponse(response) {
      if (response === 'success'){
        this.$router.push('login')
      }
    },
  },
}
</script>
