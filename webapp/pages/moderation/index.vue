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
        <thead
          :class="[
            content.caseFolderClosed ? 'decision' : 'no-decision',
            'ds-table-col',
            'ds-table-head-col',
            'ds-table-head-col-border',
          ]"
          :key="'thead-' + content.resource.id"
        >
          <tr valign="top">
            <th>
              {{ $t('moderation.reports.typeRowHeadline') }}
            </th>
            <th>
              {{ $t('moderation.reports.contentRowHeadline') }}
            </th>
            <th>
              {{ $t('moderation.reports.authorRowHeadline') }}
            </th>
            <th>
              {{ $t('moderation.reports.decisionRowHeadline') }}
            </th>
          </tr>
        </thead>
        <tbody :key="'tbody-' + content.resource.id">
          <tr valign="top">
            <td class="ds-table-col ds-table-head-col ds-table-head-col-border">
              <!-- Icon -->
              <ds-text color="soft">
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
            <!-- contentBelongsToUser -->
            <td class="ds-table-col ds-table-head-col-border">
              <hc-user
                v-if="content.contentBelongsToUser"
                :user="content.contentBelongsToUser"
                :showAvatar="false"
                :trunc="30"
              />
              <span v-else>—</span>
            </td>
            <td class="ds-table-col ds-table-head-col-border">
              <!-- caseFolderClosed -->
              <b v-if="content.caseFolderClosed">
                {{ $t('moderation.reports.decided') }}
              </b>
              <ds-button
                v-else
                danger
                class="confirm"
                :icon="content.resource.disabled ? 'eye-slash' : 'eye'"
                @click="confirm(content)"
              >
                {{ $t('moderation.reports.decideButton') }}
              </ds-button>
              <!-- decidedByModerator -->
              <div v-if="content.resource.decidedByModerator">
                <br />
                <div v-if="content.caseFolderDisable">
                  <ds-icon name="eye-slash" class="ban" />
                  {{ $t('moderation.reports.disabledBy') }}
                </div>
                <div v-else>
                  <ds-icon name="eye" class="no-ban" />
                  {{ $t('moderation.reports.enabledBy') }}
                </div>
                <hc-user
                  :user="content.resource.decidedByModerator"
                  :showAvatar="false"
                  :trunc="30"
                  :date-time="content.caseFolderUpdatedAt"
                  positionDatetime="below"
                />
              </div>
              <div v-else>
                <br />
                <div v-if="content.resource.disabled">
                  <ds-icon name="eye-slash" class="ban" />
                  {{ $t('moderation.reports.disabled') }}
                </div>
                <div v-else>
                  <ds-icon name="eye" class="no-ban" />
                  {{ $t('moderation.reports.enabled') }}
                </div>
              </div>
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
import HcEmpty from '~/components/Empty/Empty'
import HcUser from '~/components/User/User'
import { reportListQuery, decideMutation } from '~/graphql/Moderation.js'

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
        // Wolle console.log('newReports: ', newReports)
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
              caseFolderId: report.caseFolderId,
              caseFolderUpdatedAt: report.caseFolderUpdatedAt,
              caseFolderDisable: report.caseFolderDisable,
              caseFolderClosed: report.caseFolderClosed,
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
        // Wolle console.log('newReportedContentStructure: ', newReportedContentStructure)
        this.reportedContentStructure = newReportedContentStructure
      },
    },
  },
  methods: {
    confirm(content) {
      this.openModal(content)
    },
    async confirmCallback(resourceId) {
      this.$apollo
        .mutate({
          mutation: decideMutation(),
          variables: { resourceId, closed: true },
        })
        .then(() => {
          this.$toast.success(this.$t('moderation.reports.DecisionSuccess'))
          this.$apollo.queries.reports.refetch()
        })
        .catch(error => this.$toast.error(error.message))
    },
    openModal(content) {
      const identStart =
        'moderation.reports.decideModal.' +
        content.type +
        '.' +
        (content.caseFolderDisable ? 'disable' : 'enable')
      this.$store.commit('modal/SET_OPEN', {
        name: 'confirm',
        data: {
          type: content.type,
          resource: content.resource,
          modalData: {
            titleIdent: identStart + '.title',
            messageIdent: identStart + '.message',
            messageParams: {
              name:
                content.type === 'User'
                  ? content.user.name
                  : content.type === 'Post'
                  ? this.$filters.truncate(content.post.title, 30)
                  : content.type === 'Comment'
                  ? this.$filters.truncate(
                      this.$filters.removeHtml(content.comment.contentExcerpt),
                      30,
                    )
                  : '',
            },
            buttons: {
              confirm: {
                danger: true,
                icon: content.resource.disabled ? 'eye-slash' : 'eye',
                textIdent: 'moderation.reports.decideModal.submit',
                callback: () => {
                  this.confirmCallback(content.resource.id)
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
    reports: {
      query: reportListQuery(),
      variables() {
        return {}
      },
      // Wolle update({ Post }) {
      //   this.setCurrentPosts(Post)
      // },
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
