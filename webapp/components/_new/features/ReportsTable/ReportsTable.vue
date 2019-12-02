<template>
  <table
    v-if="reports && reports.length"
    class="ds-table ds-table-condensed"
    cellspacing="0"
    cellpadding="0"
  >
    <colgroup>
      <col width="5%" />
      <col width="35%" />
      <col width="20%" />
      <col width="20%" />
      <col width="20%" />
    </colgroup>
    <template v-for="report in reports">
      <thead
        :class="[report.closed ? 'decision' : 'no-decision', 'ds-table-col', 'ds-table-head-col']"
        :key="'thead-' + report.resource.id"
      >
        <tr valign="top">
          <th></th>
          <th>
            {{ $t('moderation.reports.contentRowHeadline') }}
          </th>
          <th>
            {{ $t('moderation.reports.authorRowHeadline') }}
          </th>
          <th>
            {{ $t('moderation.reports.typeRowHeadline') }}
          </th>
          <th>
            {{ $t('moderation.reports.decisionRowHeadline') }}
          </th>
        </tr>
      </thead>
      <tbody :key="'tbody-' + report.resource.id">
        <tr valign="top">
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
          <td class="ds-table-col ">
            <div v-if="isPost(report.resource) || isComment(report.resource)">
              <nuxt-link
                :to="{
                  name: 'post-id-slug',
                  params: params(report.resource),
                  hash: hashParam(report.resource),
                }"
              >
                <b>{{ report.resource.title || report.resource.contentExcerpt | truncate(50) }}</b>
              </nuxt-link>
            </div>
            <div v-else>
              <client-only>
                <hc-user :user="report.resource" :showAvatar="false" :trunc="30" />
              </client-only>
            </div>
          </td>
          <td class="ds-table-col ">
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
          <td>
            <div v-if="report.reviewed">
              <br />
              <div v-if="report.resource.disabled">
                <base-icon name="eye-slash" class="ban" />
                {{ $t('moderation.reports.disabledBy') }}
              </div>
              <div v-else>
                <base-icon name="eye" class="no-ban" />
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
                <base-icon name="eye-slash" class="ban" />
                {{ $t('moderation.reports.disabled') }}
              </div>
              <div v-else>
                <base-icon name="eye" class="no-ban" />
                {{ $t('moderation.reports.enabled') }}
              </div>
            </div>
          </td>
          <td class="ds-table-col">
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
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <counter-icon icon="flag" :count="report.filed.length">
              <ds-button ghost primary @click="showFiledReports = !showFiledReports">
                {{ $t('moderation.reports.moreDetails') }}
              </ds-button>
            </counter-icon>
          </td>
        </tr>
        <tr>
          <td class="ds-table-col filed-table" colspan="4">
            <ds-space margin-bottom="base" />
            <filed-table :filed="report.filed" v-if="showFiledReports" />
          </td>
        </tr>
      </tbody>
    </template>
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
.filed-table {
  padding-left: $space-xx-large;
}
</style>
