<template>
  <ds-space :class="{ read: notification.read, notification: true }" margin-bottom="x-small">
    <client-only>
      <ds-space margin-bottom="x-small">
        <hc-user :user="from.author" :date-time="from.createdAt" :trunc="35" />
      </ds-space>
      <ds-text class="reason-text-for-test" color="soft">
        {{ $t(`notifications.reason.${notification.reason}`) }}
      </ds-text>
    </client-only>
    <ds-space margin-bottom="x-small" />
    <nuxt-link
      class="notification-mention-post"
      :to="{ name: 'post-id-slug', params, ...hashParam }"
      @click.native="$emit('read')"
    >
      <ds-space margin-bottom="x-small">
        <ds-card
          :header="from.title || from.post.title"
          hover
          space="x-small"
          class="notifications-card"
        >
          <ds-space margin-bottom="x-small" />
          <div>
            <span v-if="isComment" class="comment-notification-header">
              {{ $t(`notifications.comment`) }}:
            </span>
            {{ from.contentExcerpt | removeHtml }}
          </div>
        </ds-card>
      </ds-space>
    </nuxt-link>
  </ds-space>
</template>

<script>
import HcUser from '~/components/User/User'

export default {
  name: 'Notification',
  components: {
    HcUser,
  },
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  computed: {
    from() {
      return this.notification.from
    },
    isComment() {
      return this.from.__typename === 'Comment'
    },
    sourceData() {
      let user = null
      let post = null
      let comment = null
      let report = null
      if (this.from.__typename === 'Post') {
        post = this.from
      } else if (this.from.__typename === 'Comment') {
        comment = this.from
        post = this.from.post
      } else if (this.from.__typename === 'Report') {
        report = {
          reasonCategory: this.from.filed.reasonCategory,
          reasonDescription: this.from.filed.reasonDescription,
        }
        if (this.from.filed.reportedResource.__typename === 'User') {
          user = this.from.filed.reportedResource
        } else if (this.from.filed.reportedResource.__typename === 'Post') {
          post = this.from.filed.reportedResource
        } else if (this.from.filed.reportedResource.__typename === 'Comment') {
          comment = this.from.filed.reportedResource
          post = this.from.filed.reportedResource.post
        }
      }
      return { user, post, comment, report }
    },
    params() {
      // Wolle const post = this.isComment ? this.from.post : this.from
      return this.sourceData.user
        ? {
            id: this.sourceData.user.id,
            slug: this.sourceData.user.slug,
          }
        : this.sourceData.post
        ? {
            id: this.sourceData.post.id,
            slug: this.sourceData.post.slug,
          }
        : {}
    },
    hashParam() {
      // Wolle return this.isComment ? { hash: `#commentId-${this.from.id}` } : {}
      return this.sourceData.comment ? { hash: `#commentId-${this.sourceData.comment.id}` } : {}
    },
  },
}
</script>

<style lang="scss">
.notification.read {
  opacity: $opacity-soft;
}
.notifications-card {
  min-width: 500px;
}
.comment-notification-header {
  font-weight: 700;
  margin-right: 0.1rem;
}
</style>
