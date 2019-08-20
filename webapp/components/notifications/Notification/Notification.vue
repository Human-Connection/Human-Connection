<template>
  <ds-space :class="[{ read: notification.read }, notification]" margin-bottom="x-small">
    <no-ssr>
      <ds-space margin-bottom="x-small">
        <hc-user
          v-if="resourceType == 'Post'"
          :user="post.author"
          :date-time="post.createdAt"
          :trunc="35"
        />
        <hc-user v-else :user="comment.author" :date-time="comment.createdAt" :trunc="35" />
      </ds-space>
      <ds-text color="soft">
        {{ $t('notifications.menu.mentioned', { resource: resourceType }) }}
      </ds-text>
    </no-ssr>
    <ds-space margin-bottom="x-small" />
    <nuxt-link
      class="notification-mention-post"
      :to="{ name: 'post-id-slug', params, ...hashParam }"
      @click.native="$emit('read')"
    >
      <ds-space margin-bottom="x-small">
        <ds-card
          :header="post.title || comment.post.title"
          hover
          space="x-small"
          class="notifications-card"
        >
          <ds-space margin-bottom="x-small" />
          <div v-if="resourceType == 'Post'">{{ post.contentExcerpt | removeHtml }}</div>
          <div v-else>
            <span class="comment-notification-header">Comment:</span>
            {{ comment.contentExcerpt | removeHtml }}
          </div>
        </ds-card>
      </ds-space>
    </nuxt-link>
  </ds-space>
</template>

<script>
import HcUser from '~/components/User'

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
    resourceType() {
      return this.post.id ? 'Post' : 'Comment'
    },
    post() {
      return this.notification.post || {}
    },
    comment() {
      return this.notification.comment || {}
    },
    params() {
      return {
        id: this.post.id || this.comment.post.id,
        slug: this.post.slug || this.comment.post.slug,
      }
    },
    hashParam() {
      return this.post.id ? {} : { hash: `#commentId-${this.comment.id}` }
    },
  },
}
</script>

<style>
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
