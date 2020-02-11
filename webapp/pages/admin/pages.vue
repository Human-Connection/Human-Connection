<template>
  <base-card>
    <h2 class="title">{{ $t('admin.pages.name') }}</h2>
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
