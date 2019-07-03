<template>
  <ds-card :header="$t('settings.security.name')">
    <change-password />
  </ds-card>
</template>

<script>
import ChangePassword from '~/components/Password/Change'

export default {
  components: {
    ChangePassword,
  },
}
</script>
