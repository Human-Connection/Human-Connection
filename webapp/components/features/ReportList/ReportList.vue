<template>
  <ds-card>
    <div class="reports-header">
      <h3 class="title">{{ $t('moderation.reports.name') }}</h3>
      <client-only>
        <dropdown-filter @filter="filter" :filterOptions="filterOptions" :selected="selected" />
      </client-only>
    </div>
    <reports-table :reports="reports" @confirm="openModal" />
  </ds-card>
</template>
<script>
import { mapMutations } from 'vuex'
import DropdownFilter from '~/components/DropdownFilter/DropdownFilter'
import ReportsTable from '~/components/features/ReportsTable/ReportsTable'
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
    modalData() {
      return function(report) {
        const identStart =
          'moderation.reports.decideModal.' +
          report.resource.__typename +
          '.' +
          (report.resource.disabled ? 'disable' : 'enable')
        return {
          name: 'confirm',
          data: {
            type: report.resource.__typename,
            resource: report.resource,
            modalData: {
              titleIdent: identStart + '.title',
              messageIdent: identStart + '.message',
              messageParams: {
                name:
                  report.resource.name ||
                  this.$filters.truncate(report.resource.title, 30) ||
                  this.$filters.truncate(
                    this.$filters.removeHtml(report.resource.contentExcerpt),
                    30,
                  ),
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
        }
      }
    },
  },
  methods: {
    ...mapMutations({
      commitModalData: 'modal/SET_OPEN',
    }),
    filter(option) {
      this.reports = option.value
      this.selected = option.label
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
      this.commitModalData(this.modalData(report))
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
.reports-header {
  display: flex;
  justify-content: space-between;
  margin: $space-small 0;

  > .title {
    margin: 0;
    font-size: $font-size-large;
  }
}
</style>
