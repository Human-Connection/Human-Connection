<template>
  <ds-card space="small">
    <ds-heading tag="h3">{{ $t('moderation.reports.name') }}</ds-heading>
    <table
      v-if="reports && reports.length"
      class="ds-table ds-table-condensed ds-table-bordered"
      cellspacing="0"
      cellpadding="0"
    >
      <colgroup><col width="" /></colgroup>
      <template v-for="report in reports">
        <thead
          :class="[
            report.closed ? 'decision' : 'no-decision',
            'ds-table-col',
            'ds-table-head-col',
            'ds-table-head-col-border',
          ]"
          :key="'thead-' + report.resource.id"
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
        <tbody :key="'tbody-' + report.resource.id">
          <tr valign="top">
            <td class="ds-table-col ds-table-head-col ds-table-head-col-border">
              <!-- Icon -->
              <ds-text color="soft">
                <ds-icon
                  v-if="report.resource.__typename === 'Post'"
                  v-tooltip="{ report: $t('report.contribution.type'), placement: 'right' }"
                  name="bookmark"
                />
                <ds-icon
                  v-else-if="report.resource.__typename === 'Comment'"
                  v-tooltip="{ report: $t('report.comment.type'), placement: 'right' }"
                  name="comments"
                />
                <ds-icon
                  v-else-if="report.resource.__typename === 'User'"
                  v-tooltip="{ report: $t('report.user.type'), placement: 'right' }"
                  name="user"
                />
                <ds-icon v-if="report.resource.disabled" name="eye-slash" class="ban" />
                <ds-icon v-else name="eye" class="no-ban" />
              </ds-text>
            </td>
            <td class="ds-table-col ds-table-head-col-border">
              <!-- reported user or other resource -->
              <div
                v-if="
                  report.resource.__typename === 'Post' || report.resource.__typename === 'Comment'
                "
              >
                <nuxt-link
                  :to="{
                    name: 'post-id-slug',
                    params: {
                      id: report.resource.id,
                      slug:
                        report.resource.__typename === 'Post'
                          ? report.resource.slug
                          : report.resource.post.slug,
                    },
                    hash:
                      report.resource.__typename === 'Comment'
                        ? `#commentId-${report.resource.id}`
                        : undefined,
                  }"
                >
                  <b v-if="report.resource.__typename === 'Post'">
                    {{ report.resource.title | truncate(100) }}
                  </b>
                  <b v-else>
                    {{ report.resource.contentExcerpt | removeHtml | truncate(100) }}
                  </b>
                </nuxt-link>
              </div>
              <div v-else>
                <hc-user :user="report.resource" :showAvatar="false" :trunc="30" />
              </div>
            </td>
            <!-- contentBelongsToUser -->
            <td class="ds-table-col ds-table-head-col-border">
              <hc-user
                v-if="report.resource.__typename !== 'User'"
                :user="report.resource.author"
                :showAvatar="false"
                :trunc="30"
              />
              <span v-else>—</span>
            </td>
            <td class="ds-table-col ds-table-head-col-border">
              <!-- latestClaim.closed -->
              <b v-if="report.closed">
                {{ $t('moderation.reports.decided') }}
              </b>
              <ds-button
                v-else
                danger
                class="confirm"
                :icon="report.resource.disabled ? 'eye-slash' : 'eye'"
                @click="confirm(report)"
              >
                {{ $t('moderation.reports.decideButton') }}
              </ds-button>
              <!-- reviewed -->
              <div v-if="report.reviewed">
                <br />
                <div v-if="report.resource.disabled">
                  <ds-icon name="eye-slash" class="ban" />
                  {{ $t('moderation.reports.disabledBy') }}
                </div>
                <div v-else>
                  <ds-icon name="eye" class="no-ban" />
                  {{ $t('moderation.reports.enabledBy') }}
                </div>
                <hc-user
                  :user="report.reviewed[0].moderator"
                  :showAvatar="false"
                  :trunc="30"
                  :date-time="report.updatedAt"
                  positionDatetime="below"
                />
              </div>
              <div v-else>
                <br />
                <div v-if="report.resource.disabled">
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
              <template>
                <div :key="report.id">
                  <!-- previousDecision -->
                  <div v-if="report.reviewed">
                    <ds-flex gutter="small">
                      <ds-flex-item width="25%">
                        <b>{{ $t('moderation.reports.previousDecision') }}</b>
                      </ds-flex-item>
                      <ds-flex-item>
                        <div>
                          <span v-if="report.resource.disabled">
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
                              <hc-relative-date-time :date-time="report.updatedAt" />
                            </client-only>
                          </ds-text>
                        </div>
                      </ds-flex-item>
                    </ds-flex>
                    <ds-space margin-bottom="x-small" />
                  </div>
                  <ds-table :data="report.filed" :fields="reportFields" condensed>
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
    confirm(report) {
      this.openModal(report)
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
                  this.confirmCallback(report.resource.id)
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
      query: reportListQuery(),
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
