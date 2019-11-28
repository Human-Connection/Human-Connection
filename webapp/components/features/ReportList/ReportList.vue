<template>
  <reports-table v-if="reports && reports.length" :reports="reports" @confirm="confirm" />
  <hc-empty v-else icon="alert" :message="$t('moderation.reports.empty')" />
</template>
<script>
import ReportsTable from '~/components/features/ReportsTable/ReportsTable'
import HcEmpty from '~/components/Empty/Empty'
import { reportsListQuery, reviewMutation } from '~/graphql/Moderation.js'

export default {
  components: {
    ReportsTable,
    HcEmpty,
  },
  data() {
    return {
      reports: [],
    }
  },
  methods: {
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
