<template>
  <ds-card space="small">
    <ds-heading tag="h3">{{ $t('moderation.reports.name') }}</ds-heading>
    <report-list />
  </ds-card>
</template>

<script>
import ReportList from '~/components/features/ReportList/ReportList'

export default {
  components: {
    ReportList,
  },
}
</script>
