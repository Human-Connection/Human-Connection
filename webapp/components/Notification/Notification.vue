<template>
  <ds-space :class="{ read: notification.read, notification: true }" margin-bottom="x-small">
    <client-only>
      <ds-space margin-bottom="x-small">
        <user-teaser :user="from.author" :date-time="from.createdAt" />
      </ds-space>
      <ds-text data-test="reason-text" color="soft">
        {{ $t(notificationReason) }}
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
import UserTeaser from '~/components/UserTeaser/UserTeaser'

export default {
  name: 'Notification',
  components: {
    UserTeaser,
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
    notificationReason() {
      const resourceType = this.isComment
        ? this.$t('notifications.comment')
        : this.$t('notifications.post')
      return this.$t(`notifications.reason.${this.notification.reason}`, { resourceType })
    },
    isComment() {
      return this.from.__typename === 'Comment'
    },
    params() {
      const post = this.isComment ? this.from.post : this.from
      return {
        id: post.id,
        slug: post.slug,
      }
    },
    hashParam() {
      return this.isComment ? { hash: `#commentId-${this.from.id}` } : {}
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
