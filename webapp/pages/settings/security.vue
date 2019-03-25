<template>
  <ds-card :header="$t('settings.security.name')">
    <change-password />
  </ds-card>
</template>

<script>
import HcEmpty from '~/components/Empty.vue'
import ChangePassword from '~/components/ChangePassword.vue'

export default {
  components: {
    ChangePassword
  }
}
</script>
