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

<style lang="scss" scoped>
.notification.read {
  opacity: 0.6; /* Real browsers */
  filter: alpha(opacity = 60); /* MSIE */
}
.notifications-card {
  min-width: 500px;
}
.comment-notification-header {
  font-weight: 700;
  margin-right: 0.1rem;
}
</style>
