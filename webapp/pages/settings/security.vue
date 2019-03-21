<template>
  <ds-card :header="$t('settings.security.name')">
    <hc-empty
      icon="tasks"
      message="Coming Soon…"
    />
  </ds-card>
</template>

<script>
import HcEmpty from '~/components/Empty.vue'

export default {
  components: {
    HcEmpty
  }
}
</script>
