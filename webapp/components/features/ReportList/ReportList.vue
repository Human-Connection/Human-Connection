<template>
  <base-card>
    <div class="reports-header">
      <h3 class="title">{{ $t('moderation.reports.name') }}</h3>
      <client-only>
        <dropdown-filter @filter="filter" :filterOptions="filterOptions" :selected="selected" />
      </client-only>
    </div>
    <reports-table :reports="reports" @confirm="openModal" />
    <pagination-buttons :hasNext="hasNext" :hasPrevious="hasPrevious" @back="back" @next="next" />
  </base-card>
</template>

<script>
import { mapMutations } from 'vuex'
import DropdownFilter from '~/components/DropdownFilter/DropdownFilter'
import ReportsTable from '~/components/features/ReportsTable/ReportsTable'
import { reportsListQuery, reviewMutation } from '~/graphql/Moderation.js'
import PaginationButtons from '~/components/_new/generic/PaginationButtons/PaginationButtons'

export default {
  components: {
    DropdownFilter,
    ReportsTable,
    PaginationButtons,
  },
  data() {
    const pageSize = 25
    return {
      reports: [],
      allReports: [],
      unreviewedReports: [],
      reviewedReports: [],
      closedReports: [],
      pageSize,
      first: pageSize,
      offset: 0,
      reviewed: null,
      closed: null,
      hasNext: false,
      selected: this.$t('moderation.reports.filterLabel.all'),
    }
  },
  computed: {
    filterOptions() {
      return [
        {
          label: this.$t('moderation.reports.filterLabel.all'),
          value: { reviewed: null, closed: null },
        },
        {
          label: this.$t('moderation.reports.filterLabel.unreviewed'),
          value: { reviewed: false, closed: false },
        },
        {
          label: this.$t('moderation.reports.filterLabel.reviewed'),
          value: { reviewed: true, closed: false },
        },
        {
          label: this.$t('moderation.reports.filterLabel.closed'),
          value: { reviewed: null, closed: true },
        },
      ]
    },
    modalData() {
      return function (report) {
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
    hasPrevious() {
      return this.offset > 0
    },
  },
  methods: {
    ...mapMutations({
      commitModalData: 'modal/SET_OPEN',
    }),
    filter(option) {
      this.selected = option.label
      this.offset = 0
      this.reviewed = option.value.reviewed
      this.closed = option.value.closed
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
        .catch((error) => this.$toast.error(error.message))
    },
    openModal(report) {
      this.commitModalData(this.modalData(report))
    },
    back() {
      this.offset = Math.max(this.offset - this.pageSize, 0)
    },
    next() {
      this.offset += this.pageSize
    },
  },
  apollo: {
    reportsList: {
      query: reportsListQuery(),
      variables() {
        const { first, offset, reviewed, closed } = this
        return {
          orderBy: 'createdAt_desc',
          reviewed,
          closed,
          first,
          offset,
        }
      },
      update({ reports }) {
        if (!reports) return []
        this.hasNext = reports.length >= this.pageSize
        this.reports = reports
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
  margin-bottom: $space-small;

  > .title {
    margin: 0;
    font-size: $font-size-large;
  }
}
</style>
