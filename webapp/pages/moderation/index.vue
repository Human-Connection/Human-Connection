<template>
  <ds-card space="small">
    <ds-heading tag="h3">{{ $t('moderation.reports.name') }}</ds-heading>
    <div
      v-if="reportedContentStructure && reportedContentStructure.length"
      class="list ds-table ds-table-condensed ds-table-bordered"
      cellspacing="0"
      cellpadding="0"
    >
      <div class="list-heading">
        <div class="ds-table-col ds-table-head-col ds-table-head-col-border">
          {{ $t('moderation.reports.type') }}
        </div>
        <div class="ds-table-col ds-table-head-col ds-table-head-col-border">
          {{ $t('moderation.reports.content') }}
        </div>
        <div class="ds-table-col ds-table-head-col ds-table-head-col-border">
          {{ $t('moderation.reports.author') }}
        </div>
        <div class="ds-table-col ds-table-head-col ds-table-head-col-border">
          {{ $t('moderation.reports.decision') }}
        </div>
      </div>
      <hc-reported-content
        v-for="content in reportedContentStructure"
        :key="`row-${content.resource.id}`"
        :content="content"
      />
    </div>
    <hc-empty v-else icon="alert" :message="$t('moderation.reports.empty')" />
  </ds-card>
</template>

<script>
import HcEmpty from '~/components/Empty.vue'
import HcReportedContent from '~/components/ReportedContent/ReportedContent'
import { reportListQuery } from '~/graphql/Moderation.js'

export default {
  components: {
    HcEmpty,
    HcReportedContent,
  },
  data() {
    return {
      reports: [],
      reportedContentStructure: [],
    }
  },

  watch: {
    reports: {
      immediate: true,
      handler(newReports) {
        const newReportedContentStructure = []
        newReports.forEach(report => {
          const resource =
            report.type === 'User'
              ? report.user
              : report.type === 'Post'
              ? report.post
              : report.type === 'Comment'
              ? report.comment
              : undefined
          let idx = newReportedContentStructure.findIndex(
            content => content.resource.id === resource.id,
          )
          // if content not in content list, then add it
          if (idx === -1) {
            idx = newReportedContentStructure.length
            newReportedContentStructure.push({
              type: report.type,
              resource,
              user: report.user,
              post: report.post,
              comment: report.comment,
              contentBelongsToUser: report.type === 'User' ? null : resource.author,
              reports: [],
            })
          }
          newReportedContentStructure[idx].reports.push(report)
        })
        this.reportedContentStructure = newReportedContentStructure
      },
    },
  },
  apollo: {
    reports: {
      query: reportListQuery(),
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
// Wolle delete?
.ds-table-head-col-border {
  border-bottom: $border-color-softer dotted $border-size-base;
}
.no-decision {
  color: $text-color-danger;
}

.list {
  // TODO: move styling into reported content
  .list-heading,
  .list-item {
    display: grid;
    grid-template-columns: 1fr 9fr 4fr 2fr;

    .icon-container,
    .content-container,
    .decision-container,
    .author-container {
      padding: 8px 4px;

      & > .label {
        display: none;
      }
    }

    & > .reports {
      grid-column-start: 2;
      grid-column-end: 5;
    }
  }
}

@media screen and (max-width: 960px) {
  .list {
    .list-heading {
      display: none;
    }

    .list-item {
      display: block;
      position: relative;
      padding-left: 10px;
      margin-bottom: 30px;

      .label {
        display: block;
        border: none;
        padding: 8px 0;
        font-weight: 600;
      }

      & > .icon-container {
        position: absolute;
        top: 0;
        left: -20px;
        padding: 8px;
      }
    }
  }
}
</style>
