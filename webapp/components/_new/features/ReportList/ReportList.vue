<template>
  <ds-card space="small">
    <ds-flex class="notifications-page-flex">
      <ds-flex-item :width="{ lg: '85%' }">
        <ds-heading tag="h3">{{ $t('moderation.reports.name') }}</ds-heading>
      </ds-flex-item>
      <ds-flex-item width="110px">
        <client-only>
          <dropdown-filter @filter="filter" :filterOptions="filterOptions" :selected="selected" />
        </client-only>
      </ds-flex-item>
    </ds-flex>
    <ds-space />
    <reports-table :reports="reports" @confirm="confirm" />
  </ds-card>
</template>
<script>
import DropdownFilter from '~/components/DropdownFilter/DropdownFilter'
import ReportsTable from '~/components/_new/features/ReportsTable/ReportsTable'
import { reportsListQuery, reviewMutation } from '~/graphql/Moderation.js'

export default {
  components: {
    DropdownFilter,
    ReportsTable,
  },
  data() {
    return {
      reports: [],
      allReports: [],
      unreviewedReports: [],
      reviewedReports: [],
      closedReports: [],
      selected: this.$t('moderation.reports.filterLabel.all'),
    }
  },
  computed: {
    filterOptions() {
      return [
        { label: this.$t('moderation.reports.filterLabel.all'), value: this.allReports },
        {
          label: this.$t('moderation.reports.filterLabel.unreviewed'),
          value: this.unreviewedReports,
        },
        { label: this.$t('moderation.reports.filterLabel.reviewed'), value: this.reviewedReports },
        { label: this.$t('moderation.reports.filterLabel.closed'), value: this.closedReports },
      ]
    },
  },
  methods: {
    filter(option) {
      this.reports = option.value
      this.selected = option.label
    },
    confirm(report) {
      this.openModal(report)
    },
    async confirmCallback(resource) {
      const { disabled: disable, id: resourceId } = resource
      this.$apollo
        .mutate({
          mutation: reviewMutation(),
          variables: { disable, resourceId, closed: true },
        })
        .then(() => {
          this.$toast.success(this.$t('moderation.reports.DecisionSuccess'))
          this.$apollo.queries.reportsList.refetch()
        })
        .catch(error => this.$toast.error(error.message))
    },
    openModal(report) {
      const identStart =
        'moderation.reports.decideModal.' +
        report.resource.__typename +
        '.' +
        (report.resource.disabled ? 'disable' : 'enable')
      this.$store.commit('modal/SET_OPEN', {
        name: 'confirm',
        data: {
          type: report.resource.__typename,
          resource: report.resource,
          modalData: {
            titleIdent: identStart + '.title',
            messageIdent: identStart + '.message',
            messageParams: {
              name:
                report.resource.__typename === 'User'
                  ? report.resource.name
                  : report.resource.__typename === 'Post'
                  ? this.$filters.truncate(report.resource.title, 30)
                  : report.resource.__typename === 'Comment'
                  ? this.$filters.truncate(
                      this.$filters.removeHtml(report.resource.contentExcerpt),
                      30,
                    )
                  : '',
            },
            buttons: {
              confirm: {
                danger: true,
                icon: report.resource.disabled ? 'eye-slash' : 'eye',
                textIdent: 'moderation.reports.decideModal.submit',
                callback: () => {
                  this.confirmCallback(report.resource)
                },
              },
              cancel: {
                icon: 'close',
                textIdent: 'moderation.reports.decideModal.cancel',
                callback: () => {},
              },
            },
          },
        },
      })
    },
  },
  apollo: {
    reportsList: {
      query: reportsListQuery(),
      update({ reports }) {
        this.reports = reports
        this.allReports = reports
        this.unreviewedReports = reports.filter(report => !report.reviewed)
        this.reviewedReports = reports.filter(report => report.reviewed)
        this.closedReports = reports.filter(report => report.closed)
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.decision {
  color: $color-secondary;
}
.no-decision {
  color: $color-warning;
}
.ban {
  color: $color-danger;
}
.no-ban {
  color: $color-success;
}
</style>
