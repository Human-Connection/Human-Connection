<template>
  <table class="ds-table ds-table-condensed ds-table-bordered" cellspacing="0" cellpadding="0">
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
              <client-only>
                <hc-user :user="report.resource" :showAvatar="false" :trunc="30" />
              </client-only>
            </div>
            <!-- <div v-if="report.reviewed">
              <ds-space margin="x-large"/>
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
            </div> -->
          </td>
          <!-- contentBelongsToUser -->
          <td class="ds-table-col ds-table-head-col-border">
            <client-only>
              <hc-user
                v-if="report.resource.__typename !== 'User'"
                :user="report.resource.author"
                :showAvatar="false"
                :trunc="30"
              />
              <span v-else>—</span>
            </client-only>
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
              <client-only>
                <hc-user
                  :user="report.reviewed[0].moderator"
                  :showAvatar="false"
                  :trunc="30"
                  :date-time="report.updatedAt"
                  positionDatetime="below"
                />
              </client-only>
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
            <div>
              <ds-space margin-bottom="base" />
              <filed-table :filed="report.filed" />
            </div>
          </td>
        </tr>
      </tbody>
    </template>
  </table>
</template>
<script>
// import HcRelativeDateTime from '~/components/RelativeDateTime'
import HcUser from '~/components/User/User'
import FiledTable from '~/components/generic/FiledTable/FiledTable'

export default {
  components: {
    // HcRelativeDateTime,
    HcUser,
    FiledTable,
  },
  props: {
    reports: { type: Array, default: () => [] },
  },
  methods: {
    confirm(report) {
      this.$emit('confirm', report)
    },
  },
}
</script>
