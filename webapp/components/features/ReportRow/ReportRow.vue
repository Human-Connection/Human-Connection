<template>
  <tbody class="report-row">
    <tr>
      <!-- Icon Column -->
      <td class="ds-table-col">
        <base-icon :name="iconName" :title="iconLabel" />
      </td>

      <!-- Number of Filed Reports Column -->
      <td class="ds-table-col">
        <span class="user-count">
          {{ $t('moderation.reports.numberOfUsers', { count: report.filed.length }) }}
        </span>
        <base-button size="small" @click="showFiledReports = !showFiledReports">
          {{ $t('moderation.reports.moreDetails') }}
        </base-button>
      </td>

      <!-- Content Column -->
      <td class="ds-table-col" data-test="report-content">
        <client-only v-if="isUser">
          <user-teaser :user="report.resource" :showAvatar="false" :showPopover="false" />
        </client-only>
        <nuxt-link v-else class="title" :to="linkTarget">
          {{ linkText | truncate(50) }}
        </nuxt-link>
      </td>

      <!-- Author Column -->
      <td class="ds-table-col" data-test="report-author">
        <client-only v-if="!isUser">
          <user-teaser :user="report.resource.author" :showAvatar="false" :showPopover="false" />
        </client-only>
        <span v-else>—</span>
      </td>

      <!-- Status Column -->
      <td class="ds-table-col" data-test="report-reviewer">
        <span class="status-line">
          <base-icon :name="statusIconName" :class="isDisabled ? '--disabled' : '--enabled'" />
          {{ statusText }}
        </span>
        <client-only v-if="isReviewed">
          <user-teaser
            :user="moderatorOfLatestReview"
            :showAvatar="false"
            :date-time="report.updatedAt"
            :showPopover="false"
          />
        </client-only>
      </td>

      <!-- Decision Column -->
      <td class="ds-table-col">
        <span v-if="report.closed" class="title">
          {{ $t('moderation.reports.decided') }}
        </span>
        <base-button
          v-else
          danger
          filled
          data-test="confirm"
          size="small"
          :icon="statusIconName"
          @click="$emit('confirm-report')"
        >
          {{ $t('moderation.reports.decideButton') }}
        </base-button>
      </td>
    </tr>

    <tr class="row">
      <td colspan="100%">
        <filed-reports-table :filed="report.filed" v-if="showFiledReports" />
      </td>
    </tr>
  </tbody>
</template>

<script>
import FiledReportsTable from '~/components/features/FiledReportsTable/FiledReportsTable'
import UserTeaser from '~/components/UserTeaser/UserTeaser'

export default {
  components: {
    FiledReportsTable,
    UserTeaser,
  },
  props: {
    report: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showFiledReports: false,
    }
  },
  computed: {
    isPost() {
      return this.report.resource.__typename === 'Post'
    },
    isComment() {
      return this.report.resource.__typename === 'Comment'
    },
    isUser() {
      return this.report.resource.__typename === 'User'
    },
    isDisabled() {
      return this.report.resource.disabled
    },
    isReviewed() {
      const { reviewed } = this.report
      return reviewed && reviewed.length
    },
    iconName() {
      if (this.isPost) return 'bookmark'
      else if (this.isComment) return 'comments'
      else if (this.isUser) return 'user'
      else return null
    },
    iconLabel() {
      if (this.isPost) return this.$t('report.contribution.type')
      else if (this.isComment) return this.$t('report.comment.type')
      else if (this.isUser) return this.$t('report.user.type')
      else return null
    },
    linkTarget() {
      const { id, slug } = this.isComment ? this.report.resource.post : this.report.resource
      return {
        name: 'post-id-slug',
        params: { id, slug },
        hash: this.isComment ? `#commentId-${this.report.resource.id}` : '',
      }
    },
    linkText() {
      return (
        this.report.resource.title || this.$filters.removeHtml(this.report.resource.contentExcerpt)
      )
    },
    statusIconName() {
      return this.isDisabled ? 'eye-slash' : 'eye'
    },
    statusText() {
      if (!this.isReviewed) return this.$t('moderation.reports.enabled')
      else if (this.isDisabled) return this.$t('moderation.reports.disabledBy')
      else return this.$t('moderation.reports.enabledBy')
    },
    moderatorOfLatestReview() {
      const [latestReview] = this.report.reviewed
      return latestReview && latestReview.moderator
    },
  },
}
</script>

<style lang="scss">
.report-row {
  &:nth-child(2n + 1) {
    background-color: $color-neutral-95;
  }

  .title {
    font-weight: $font-weight-bold;
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

  .--disabled {
    color: $color-danger;
  }

  .--enabled {
    color: $color-success;
  }
}
</style>
