<template>
  <div>
    <ds-space>
      <ds-card :header="$t('settings.filed-reports.name')"></ds-card>
    </ds-space>
    <filed-reports-table :filed-reports="filedReports" />
  </div>
</template>

<script>
import filedReportsQuery from '~/graphql/settings/FiledReports'
import FiledReportsTable from '~/components/features/FiledReportsTable/FiledReportsTable'

export default {
  components: {
    FiledReportsTable,
  },
  data() {
    return {
      filedReports: [],
    }
  },
  apollo: {
    filedReports: { query: filedReportsQuery, fetchPolicy: 'cache-and-network' },
  },
}
</script>
