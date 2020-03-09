<template>
  <table
    v-if="reports && reports.length"
    class="ds-table ds-table-condensed ds-table-bordered reports-table"
    cellspacing="0"
    cellpadding="0"
  >
    <colgroup>
      <col width="4%" />
      <col width="14%" />
      <col width="36%" />
      <col width="14%" />
      <col width="20%" />
      <col width="12%" />
    </colgroup>
    <thead class="ds-table-col ds-table-head-col">
      <tr valign="top">
        <th class="ds-table-head-col"></th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.submitter') }}</th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.content') }}</th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.author') }}</th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.status') }}</th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.decision') }}</th>
      </tr>
    </thead>
    <template v-for="report in reports">
      <!-- should be ':key="report.resource.id"' for having one element for every resource, but this crashes at the moment, because the 'reports' query returns multiple reports on the same resource! I will create an issue -->
      <report-row :key="report.id" :report="report" @confirm-report="$emit('confirm', report)" />
    </template>
  </table>
  <hc-empty v-else icon="alert" :message="$t('moderation.reports.empty')" />
</template>

<script>
import HcEmpty from '~/components/Empty/Empty'
import ReportRow from '~/components/features/ReportRow/ReportRow'

export default {
  components: {
    HcEmpty,
    ReportRow,
  },
  props: {
    reports: { type: Array, default: () => [] },
  },
}
</script>
