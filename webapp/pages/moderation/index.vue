<template>
  <ds-card space="small">
    <ds-heading tag="h3">{{ $t('moderation.reports.name') }}</ds-heading>
    <table
      v-if="reportedContentStructure && reportedContentStructure.length"
      class="ds-table ds-table-condensed ds-table-bordered"
      cellspacing="0"
      cellpadding="0"
    >
      <colgroup><col width="" /></colgroup>
      <template v-for="content in reportedContentStructure">
        <thead :key="'thead-' + content.resource.id">
          <tr valign="top">
            <th class="ds-table-col ds-table-head-col ds-table-head-col-border">
              {{ $t('moderation.reports.type') }}
            </th>
            <th class="ds-table-col ds-table-head-col ds-table-head-col-border">
              {{ $t('moderation.reports.content') }}
            </th>
            <th class="ds-table-col ds-table-head-col ds-table-head-col-border">
              {{ $t('moderation.reports.author') }}
            </th>
            <th class="ds-table-col ds-table-head-col ds-table-head-col-border">
              {{ $t('moderation.reports.decision') }}
            </th>
          </tr>
        </thead>
        <tbody :key="'tbody-' + content.resource.id">
          <tr valign="top">
            <td class="ds-table-col ds-table-head-col ds-table-head-col-border">
              <!-- Icon -->
              <ds-text
                :class="[!content.resource.decidedByModerator && 'no-decision']"
                color="soft"
              >
                <ds-icon
                  v-if="content.type === 'Post'"
                  v-tooltip="{ content: $t('report.contribution.type'), placement: 'right' }"
                  name="bookmark"
                />
                <ds-icon
                  v-else-if="content.type === 'Comment'"
                  v-tooltip="{ content: $t('report.comment.type'), placement: 'right' }"
                  name="comments"
                />
                <ds-icon
                  v-else-if="content.type === 'User'"
                  v-tooltip="{ content: $t('report.user.type'), placement: 'right' }"
                  name="user"
                />
              </ds-text>
            </td>
            <td class="ds-table-col ds-table-head-col-border">
              <!-- reported user or content -->
              <div v-if="content.type === 'Post' || content.type === 'Comment'">
                <nuxt-link
                  :to="{
                    name: 'post-id-slug',
                    params: {
                      id: content.type === 'Post' ? content.post.id : content.comment.post.id,
                      slug: content.type === 'Post' ? content.post.slug : content.comment.post.slug,
                    },
                    hash:
                      content.type === 'Comment' ? `#commentId-${content.comment.id}` : undefined,
                  }"
                >
                  <b v-if="content.type === 'Post'">{{ content.post.title | truncate(100) }}</b>
                  <b v-else>{{ content.comment.contentExcerpt | removeHtml | truncate(100) }}</b>
                </nuxt-link>
              </div>
              <div v-else>
                <hc-user :user="content.user" :showAvatar="false" :trunc="30" />
              </div>
            </td>
            <td class="ds-table-col ds-table-head-col-border">
              <ds-flex v-if="content.contentBelongsToUser">
                <ds-flex-item width="20px">
                  <ds-icon
                    v-tooltip="{ content: $t('report.author'), placement: 'right' }"
                    name="user"
                  />
                </ds-flex-item>
                <ds-flex-item>
                  <hc-user :user="content.contentBelongsToUser" :showAvatar="false" :trunc="30" />
                </ds-flex-item>
              </ds-flex>
              <span v-else>—</span>
            </td>
            <td class="ds-table-col ds-table-head-col-border">
              <!-- disabledBy -->
              <div v-if="content.resource.decidedByModerator">
                {{ $t('moderation.reports.disabledBy') }}
                <br />
                <hc-user
                  :user="content.resource.decidedByModerator"
                  :showAvatar="false"
                  :trunc="30"
                />
              </div>
              <span v-else class="no-decision">{{ $t('moderation.reports.noDecision') }}</span>
            </td>
          </tr>
          <tr>
            <td class="ds-table-col ds-table-head-col-border"></td>
            <td class="ds-table-col ds-table-head-col-border" colspan="3">
              <ds-table :data="content.reports" :fields="reportFields" condensed>
                <!-- submitter -->
                <template slot="submitter" slot-scope="scope">
                  <hc-user
                    :user="scope.row.submitter"
                    :showAvatar="false"
                    :trunc="30"
                    :date-time="scope.row.createdAt"
                    :positionDatetime="'below'"
                  />
                </template>
                <!-- reasonCategory -->
                <template slot="reasonCategory" slot-scope="scope">
                  {{ $t('report.reason.category.options.' + scope.row.reasonCategory) }}
                </template>
                <!-- reasonDescription -->
                <template slot="reasonDescription" slot-scope="scope">
                  {{ scope.row.reasonDescription.length ? scope.row.reasonDescription : '—' }}
                </template>
              </ds-table>
            </td>
          </tr>
        </tbody>
      </template>
    </table>
    <hc-empty v-else icon="alert" :message="$t('moderation.reports.empty')" />
  </ds-card>
</template>

<script>
import HcEmpty from '~/components/Empty.vue'
import HcUser from '~/components/User/User'
import { reportListQuery } from '~/graphql/Moderation.js'

export default {
  components: {
    HcEmpty,
    HcUser,
  },
  data() {
    return {
      reports: [],
      reportedContentStructure: [],
    }
  },
  computed: {
    reportFields() {
      return {
        submitter: this.$t('moderation.reports.submitter'),
        reasonCategory: this.$t('moderation.reports.reasonCategory'),
        reasonDescription: this.$t('moderation.reports.reasonDescription'),
        // Wolle createdAt: this.$t('moderation.reports.createdAt'),
      }
    },
    // Wolle delete + language
    fields() {
      return {
        type: ' ',
        reportedUserContent: ' ',
        reasonCategory: this.$t('moderation.reports.reasonCategory'),
        reasonDescription: this.$t('moderation.reports.reasonDescription'),
        submitter: this.$t('moderation.reports.submitter'),
        createdAt: this.$t('moderation.reports.createdAt'),
        disabledBy: this.$t('moderation.reports.disabledBy'),
        // actions: ' '
      }
    },
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
</style>
