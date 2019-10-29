<template>
  <div class="list-item">
    <div class="icon-container">
      <!-- Icon -->
      <ds-text :class="[!content.resource.disabledBy && 'no-decision']" color="soft">
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
    </div>
    <div class="content-container">
      <!-- reported user or content -->
      <div v-if="content.type === 'Post' || content.type === 'Comment'">
        <nuxt-link
          :to="{
            name: 'post-id-slug',
            params: {
              id: content.type === 'Post' ? content.post.id : content.comment.post.id,
              slug: content.type === 'Post' ? content.post.slug : content.comment.post.slug,
            },
            hash: content.type === 'Comment' ? `#commentId-${content.comment.id}` : undefined,
          }"
        >
          <b v-if="content.type === 'Post'">{{ content.post.title | truncate(100) }}</b>
          <b v-else>{{ content.comment.contentExcerpt | removeHtml | truncate(100) }}</b>
        </nuxt-link>
      </div>
      <div v-else>
        <hc-user :user="content.user" :showAvatar="false" :trunc="30" />
      </div>
    </div>
    <div class="author-container">
      <div class="label">
        {{ $t('moderation.reports.author') }}
      </div>
      <ds-flex v-if="content.contentBelongsToUser">
        <ds-flex-item width="20px">
          <ds-icon v-tooltip="{ content: $t('report.author'), placement: 'right' }" name="user" />
        </ds-flex-item>
        <ds-flex-item>
          <hc-user :user="content.contentBelongsToUser" :showAvatar="false" :trunc="30" />
        </ds-flex-item>
      </ds-flex>
      <span v-else>—</span>
    </div>
    <div class="decision-container">
      <!-- disabledBy -->
      <div class="label">
        {{ $t('moderation.reports.decision') }}
      </div>
      <div v-if="content.resource.disabledBy">
        {{ $t('moderation.reports.disabledBy') }}
        <br />
        <hc-user :user="content.resource.disabledBy" :showAvatar="false" :trunc="30" />
      </div>
      <span v-else class="no-decision">{{ $t('moderation.reports.noDecision') }}</span>
    </div>

    <!-- TODO: add reports list -->
  </div>
</template>

<script>
import HcUser from '~/components/User/User'

export default {
  name: 'HcReportedContent',
  components: {
    HcUser,
  },
  props: ['content'],
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
}
</script>
