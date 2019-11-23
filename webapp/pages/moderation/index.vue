<template>
  <ds-card space="small">
    <ds-heading tag="h3">{{ $t('moderation.reports.name') }}</ds-heading>
    <table
      v-if="resourcesClaims && resourcesClaims.length"
      class="ds-table ds-table-condensed ds-table-bordered"
      cellspacing="0"
      cellpadding="0"
    >
      <colgroup><col width="" /></colgroup>
      <template v-for="content in resourcesClaims">
        <thead
          :class="[
            content.latestClaim.closed ? 'decision' : 'no-decision',
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
                <ds-icon v-if="content.resource.disabled" name="eye-slash" class="ban" />
                <ds-icon v-else name="eye" class="no-ban" />
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
              <!-- latestClaim.closed -->
              <b v-if="content.latestClaim.closed">
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
              <!-- reviewedByModerator -->
              <div v-if="content.resource.reviewedByModerator">
                <br />
                <div v-if="content.latestClaim.disable">
                  <ds-icon name="eye-slash" class="ban" />
                  {{ $t('moderation.reports.disabledBy') }}
                </div>
                <div v-else>
                  <ds-icon name="eye" class="no-ban" />
                  {{ $t('moderation.reports.enabledBy') }}
                </div>
                <hc-user
                  :user="content.resource.reviewedByModerator"
                  :showAvatar="false"
                  :trunc="30"
                  :date-time="content.latestClaim.updatedAt"
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
              <template v-for="(claim, indexClaim) in content.claims">
                <div :key="claim.id">
                  <!-- previousDecision -->
                  <div v-if="indexClaim > 0">
                    <ds-flex gutter="small">
                      <ds-flex-item width="25%">
                       <b>{{ $t('moderation.reports.previousDecision') }}</b>
                      </ds-flex-item>
                      <ds-flex-item>
                        <div>
                          <span v-if="claim.disable">
                            <ds-icon name="eye-slash" class="ban" />
                            {{ $t('moderation.reports.disabledAt') }}
                          </span>
                          <span v-else>
                            <ds-icon name="eye" class="no-ban" />
                            {{ $t('moderation.reports.enabledAt') }}
                          </span>
                          <ds-text size="small" color="soft">
                            <ds-icon name="clock" />
                            <client-only>
                              <hc-relative-date-time :date-time="claim.updatedAt" />
                            </client-only>
                          </ds-text>
                        </div>
                      </ds-flex-item>
                    </ds-flex>
                    <ds-space margin-bottom="x-small" />
                  </div>
                  <ds-table :data="claim.reports" :fields="reportFields" condensed>
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
                  <ds-space margin-bottom="base" />
                </div>
              </template>
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
import HcRelativeDateTime from '~/components/RelativeDateTime'
import HcUser from '~/components/User/User'
import { reportListQuery, reviewMutation } from '~/graphql/Moderation.js'

export default {
  components: {
    HcEmpty,
    HcRelativeDateTime,
    HcUser,
  },
  data() {
    return {
      reports: [],
      resourcesClaims: [],
    }
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
  methods: {
    confirm(content) {
      this.openModal(content)
    },
    async confirmCallback(resourceId) {
      this.$apollo
        .mutate({
          mutation: reviewMutation(),
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
        (content.latestClaim.disable ? 'disable' : 'enable')
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
      update({ reports }) {
        const newResourcesClaims = []

        reports.forEach(report => {
          const resource =
            report.type === 'User'
              ? report.user
              : report.type === 'Post'
              ? report.post
              : report.type === 'Comment'
              ? report.comment
              : undefined
          let idxResource = newResourcesClaims.findIndex(
            content => content.resource.id === resource.id,
          )
          // if resource is not in resource list, then add it
          if (idxResource === -1) {
            idxResource = newResourcesClaims.length
            newResourcesClaims.push({
              type: report.type,
              resource,
              user: report.user,
              post: report.post,
              comment: report.comment,
              contentBelongsToUser: report.type === 'User' ? null : resource.author,
              claims: [],
            })
          }
          let idxClaim = newResourcesClaims[idxResource].claims.findIndex(
            claim => claim.id === report.claimId,
          )
          // if claim is not in claim list, then add it
          if (idxClaim === -1) {
            idxClaim = newResourcesClaims[idxResource].claims.length
            newResourcesClaims[idxResource].claims.push({
              // it is the same for all reports of a claim
              id: report.claimId,
              createdAt: report.claimCreatedAt,
              updatedAt: report.claimUpdatedAt,
              disable: report.claimDisable,
              closed: report.claimClosed,
              reports: [],
            })
          }
          newResourcesClaims[idxResource].claims[idxClaim].reports.push(report)
        })

        // sorting of resource claims and their reports
        newResourcesClaims.forEach(resourceClaims => {
          // latestClaim by updatedAt rules
          resourceClaims.claims.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
          )
          resourceClaims.latestClaim = {
            id: resourceClaims.claims[0].id,
            createdAt: resourceClaims.claims[0].createdAt,
            updatedAt: resourceClaims.claims[0].updatedAt,
            disable: resourceClaims.claims[0].disable,
            closed: resourceClaims.claims[0].closed,
          }
          // display claims always by starting with latest createdAt
          resourceClaims.claims.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          )

          resourceClaims.claims.forEach(claim => {
            // display reports always by starting with latest createdAt
            claim.reports.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            )
          })
        })
        // display resources by starting with claims by their latest createdAt
        newResourcesClaims.sort(
          (a, b) => new Date(b.claims[0].createdAt) - new Date(a.claims[0].createdAt),
        )
        
        this.resourcesClaims = newResourcesClaims
        return reports
      },
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
