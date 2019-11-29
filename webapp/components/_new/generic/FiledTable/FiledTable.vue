<template>
  <ds-table v-if="filed && filed.length" :data="filed" :fields="reportFields" condensed>
    <template #submitter="scope">
      <ds-space margin-bottom="base">
        <hc-user
          :user="scope.row.submitter"
          :showAvatar="false"
          :trunc="30"
          :date-time="scope.row.createdAt"
          :position-date-time="'below'"
        />
      </ds-space>
    </template>
    <template #reasonCategory="scope">
      {{ $t('report.reason.category.options.' + scope.row.reasonCategory) }}
    </template>
    <template #reasonDescription="scope">
      {{ scope.row.reasonDescription.length ? scope.row.reasonDescription : '—' }}
    </template>
  </ds-table>
</template>
<script>
import HcUser from '~/components/User/User'

export default {
  components: {
    HcUser,
  },
  props: {
    filed: { type: Array, default: () => [] },
  },
  computed: {
    reportFields() {
      return {
        submitter: this.$t('moderation.reports.submitter'),
        reasonCategory: this.$t('moderation.reports.reasonCategory'),
        reasonDescription: this.$t('moderation.reports.reasonDescription'),
      }
    },
  },
}
</script>
