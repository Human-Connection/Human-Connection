<template>
  <ds-container width="small">
    <ds-flex>
      <ds-flex-item :width="{ base: '100%' }" centered>
        <ds-space style="text-align: center;" margin-top="small" margin-bottom="xxx-small" centered>
          <password-reset />
        </ds-space>
      </ds-flex-item>
    </ds-flex>
  </ds-container>
</template>

<script>
import PasswordReset from '~/components/PasswordReset/PasswordReset'

export default {
  layout: 'default',
  components: {
    PasswordReset,
  }
}
</script>
