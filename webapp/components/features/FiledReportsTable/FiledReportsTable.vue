<template>
  <ds-card v-if="filedReports && filedReports.length > 0">
    <ds-table :data="filedReports" :fields="fields" condensed>
      <template #resource="scope">
        <filed-report :filed-report="scope.row" />
      </template>
    </ds-table>
  </ds-card>
  <ds-card v-else>
    <ds-space>
      <ds-placeholder>
        {{ $t('settings.filed-reports.empty') }}
      </ds-placeholder>
    </ds-space>
  </ds-card>
</template>

<script>
import FiledReport from '~/components/features/FiledReport/FiledReport'

export default {
  components: {
    FiledReport,
  },
  props: {
    filedReports: { type: Array, default: () => [] },
  },
  computed: {
    fields() {
      return {
        resource: this.$t('settings.filed-reports.columns.resource'),
        reasonDescription: this.$t('settings.filed-reports.columns.reasonDescription'),
        reasonCategory: this.$t('settings.filed-reports.columns.reasonCategory'),
      }
    },
  },
}
</script>
