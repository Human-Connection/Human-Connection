<template>
  <base-card>
    <h2 class="title">{{ $t('settings.invites.name') }}</h2>
    <hc-empty icon="tasks" message="Coming Soon…" />
  </base-card>
</template>

<script>
import HcEmpty from '~/components/Empty/Empty'

export default {
  components: {
    HcEmpty,
  },
}
</script>
