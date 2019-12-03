<template>
  <table
    v-if="reports && reports.length"
    class="ds-table ds-table-condensed ds-table-bordered reports-table"
    cellspacing="0"
    cellpadding="0"
  >
    <colgroup>
      <col width="4%" />
      <col width="12%" />
      <col width="40%" />
      <col width="16%" />
      <col width="16%" />
      <col width="12%" />
    </colgroup>
    <thead class="ds-table-col ds-table-head-col">
      <tr valign="top">
        <th class="ds-table-head-col"></th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.submitter') }}</th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.content') }}</th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.author') }}</th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.status') }}</th>
        <th class="ds-table-head-col">{{ $t('moderation.reports.decision') }}</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="report in reports">
        <tr :key="report.resource.id" valign="top" class="row" :data-test="report.resource.__typename">
          <td class="ds-table-col">
            <ds-text color="soft">
              <base-icon
                v-if="isPost(report.resource)"
                v-tooltip="{ report: $t('report.contribution.type'), placement: 'right' }"
                name="bookmark"
              />
              <base-icon
                v-else-if="isComment(report.resource)"
                v-tooltip="{ report: $t('report.comment.type'), placement: 'right' }"
                name="comments"
              />
              <base-icon
                v-else-if="isUser(report.resource)"
                v-tooltip="{ report: $t('report.user.type'), placement: 'right' }"
                name="user"
              />
            </ds-text>
          </td>
          <td class="ds-table-col">
            <span class="user-count">
              {{ $t('moderation.reports.numberOfUsers', { count: report.filed.length }) }}
            </span>
            <ds-button size="small" @click="showFiledReports = !showFiledReports">
              {{ $t('moderation.reports.moreDetails') }}
            </ds-button>
          </td>
          <td class="ds-table-col">
            <div v-if="isPost(report.resource) || isComment(report.resource)">
              <nuxt-link
                data-test="post-link"
                :to="{
                  name: 'post-id-slug',
                  params: params(report.resource),
                  hash: hashParam(report.resource),
                }"
              >
                <b>
                  {{
                    report.resource.title ||
                      $filters.removeHtml(report.resource.contentExcerpt) | truncate(50)
                  }}
                </b>
              </nuxt-link>
            </div>
            <div v-else>
              <client-only>
                <hc-user
                  :user="report.resource"
                  :showAvatar="false"
                  :trunc="30"
                  :data-test="report.resource.slug"
                />
              </client-only>
            </div>
          </td>
          <td class="ds-table-col">
            <client-only>
              <hc-user
                v-if="report.resource.__typename !== 'User'"
                :user="report.resource.author"
                :showAvatar="false"
                :trunc="30"
                :data-test="report.resource.author.slug"
              />
              <span v-else>—</span>
            </client-only>
          </td>
          <td class="ds-table-col">
            <template v-if="report.reviewed">
              <span v-if="report.resource.disabled" data-test="disabled" class="status-line">
                <base-icon name="eye-slash" class="ban" />
                {{ $t('moderation.reports.disabledBy') }}
              </span>
              <span v-else data-test="enabled" class="status-line">
                <base-icon name="eye" class="no-ban" />
                {{ $t('moderation.reports.enabledBy') }}
              </span>
              <client-only>
                <hc-user
                  :user="moderatorOfLatestReview(report)"
                  :showAvatar="false"
                  :trunc="30"
                  :date-time="report.updatedAt"
                  positionDatetime="below"
                  :data-test="moderatorOfLatestReview(report).slug"
                />
              </client-only>
            </template>
            <div v-else>
              <div data-test="unreviewed">
                <base-icon name="eye" class="no-ban" />
                {{ $t('moderation.reports.enabled') }}
              </div>
            </div>
          </td>
          <td class="ds-table-col">
            <b v-if="report.closed" data-test="closed">
              {{ $t('moderation.reports.decided') }}
            </b>
            <ds-button
              v-else
              danger
              class="confirm"
              size="small"
              :icon="report.resource.disabled ? 'eye-slash' : 'eye'"
              @click="confirm(report)"
            >
              {{ $t('moderation.reports.decideButton') }}
            </ds-button>
          </td>
        </tr>
        <tr :key="'nested-table-' + report.resource.id" class="row">
          <td colspan="100%">
            <filed-table :filed="report.filed" v-if="showFiledReports" />
          </td>
        </tr>
      </template>
    </tbody>
  </table>
  <hc-empty v-else icon="alert" :message="$t('moderation.reports.empty')" />
</template>

<script>
import CounterIcon from '~/components/_new/generic/CounterIcon/CounterIcon'
import HcUser from '~/components/User/User'
import FiledTable from '~/components/_new/features/FiledTable/FiledTable'
import HcEmpty from '~/components/Empty/Empty'

export default {
  components: {
    CounterIcon,
    HcUser,
    FiledTable,
    HcEmpty,
  },
  data() {
    return {
      showFiledReports: false,
    }
  },
  props: {
    reports: { type: Array, default: () => [] },
  },
  methods: {
    confirm(report) {
      this.$emit('confirm', report)
    },
    isComment(resource) {
      return resource.__typename === 'Comment'
    },
    isPost(resource) {
      return resource.__typename === 'Post'
    },
    isUser(resource) {
      return resource.__typename === 'User'
    },
    moderatorOfLatestReview(report) {
      return report.reviewed[0].moderator
    },
    params(resource) {
      const post = this.isComment(resource) ? resource.post : resource
      return {
        id: post.id,
        slug: post.slug,
      }
    },
    hashParam(resource) {
      return this.isComment(resource) ? `#commentId-${resource.id}` : ''
    },
  },
}
</script>
<style lang="scss">
.reports-table {
  .row {
    position: relative;
  }

  .row:nth-child(4n+1) {
    background-color: $color-neutral-95;
  }

  .row:nth-child(4n+2) {
    background-color: $color-neutral-95;
  }
}

.status-line {
  display: inline-flex;

  > .base-icon {
    margin-right: $space-xx-small;
  }
}

.user-count {
  display: block;
  margin-bottom: $space-xx-small;
}

.nested-table-toggle {
  position: absolute;
  left: 0;
  bottom: 0;
}

.filed-table {
  padding-left: $space-xx-large;
}
</style>
