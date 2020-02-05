<template>
  <ds-table
    class="nested-table"
    v-if="filed && filed.length"
    :data="filed"
    :fields="fields"
    condensed
  >
    <template #submitter="scope">
      <user-teaser
        :user="scope.row.submitter"
        :showAvatar="false"
        :showPopover="false"
        data-test="filing-user"
      />
    </template>
    <template #reportedOn="scope">
      <ds-text size="small">
        <hc-relative-date-time :date-time="scope.row.createdAt" data-test="filed-date" />
      </ds-text>
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
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import HcRelativeDateTime from '~/components/RelativeDateTime'

export default {
  components: {
    UserTeaser,
    HcRelativeDateTime,
  },
  props: {
    filed: { type: Array, default: () => [] },
  },
  computed: {
    fields() {
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

<style lang="scss">
.nested-table {
  padding: $space-small;
  border-top: $border-size-base solid $color-neutral-60;
  border-bottom: $border-size-base solid $color-neutral-60;
}
</style>
