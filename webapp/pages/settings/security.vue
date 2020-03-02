<template>
  <base-card>
    <h2 class="title">{{ $t('settings.security.name') }}</h2>
    <change-password />
  </base-card>
</template>

<script>
import ChangePassword from '~/components/Password/Change'

export default {
  components: {
    ChangePassword,
  },
}
</script>
