<template>
  <ds-space margin-bottom="base">
    <ds-table v-if="filed && filed.length" :data="filed" :fields="reportFields" condensed>
      <template #submitter="scope">
        <hc-user :user="scope.row.submitter" :showAvatar="false" :trunc="30" />
      </template>
      <template #reportedOn="scope">
        <ds-text size="small">
          <hc-relative-date-time :date-time="scope.row.createdAt" />
        </ds-text>
      </template>
      <template #reasonCategory="scope">
        {{ $t('report.reason.category.options.' + scope.row.reasonCategory) }}
      </template>
      <template #reasonDescription="scope">
        {{ scope.row.reasonDescription.length ? scope.row.reasonDescription : '—' }}
      </template>
    </ds-table>
  </ds-space>
</template>
<script>
import HcUser from '~/components/User/User'
import HcRelativeDateTime from '~/components/RelativeDateTime'

export default {
  components: {
    HcUser,
    HcRelativeDateTime,
  },
  props: {
    filed: { type: Array, default: () => [] },
  },
  computed: {
    reportFields() {
      return {
        submitter: {
          label: this.$t('moderation.reports.submitter'),
          width: '15%',
        },
        reportedOn: {
          label: this.$t('moderation.reports.reportedOn'),
          width: '20%',
        },
        reasonCategory: {
          label: this.$t('moderation.reports.reasonCategory'),
          width: '30%',
        },
        reasonDescription: {
          label: this.$t('moderation.reports.reasonDescription'),
          width: '35%',
        },
      }
    },
  },
}
</script>
