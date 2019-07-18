<template>
  <ds-space :class="{ notification: true, read: notification.read }" margin-bottom="x-small">
    <no-ssr>
      <ds-space margin-bottom="x-small">
        <hc-user
          :user="post.author || comment.author"
          :date-time="post.createdAt || comment.createdAt"
          :trunc="35"
        />
      </ds-space>
      <ds-text color="soft">
        {{ $t('notifications.menu.mentioned', { resource: post.id ? 'post' : 'comment' }) }}
      </ds-text>
    </no-ssr>
    <ds-space margin-bottom="x-small" />
    <nuxt-link
      class="notification-mention-post"
      :to="{ name: 'post-id-slug', params: postParams, hash: `#commentId-${comment.id}` }"
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
          <!-- eslint-disable vue/no-v-html -->
          <div v-html="excerpt" />
          <!-- eslint-enable vue/no-v-html -->
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
    excerpt() {
      const excerpt = this.post.id ? this.post.contentExcerpt : this.comment.contentExcerpt
      return (
        (!this.post.id ? '<b>Comment: </b>' : '') + excerpt.replace(/<(?:.|\n)*?>/gm, '').trim()
      )
    },
    post() {
      return this.notification.post || {}
    },
    comment() {
      return this.notification.comment || {}
    },
    postParams() {
      return {
        id: this.post.id || this.comment.post.id,
        slug: this.post.slug || this.comment.post.slug,
      }
    },
    queryParams() {
      console.log('this.post.id: ', this.post.id, 'this.comment.id: ', this.comment.id)
      return this.post.id ? {} : { commentId: `id-${this.comment.id}` }
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
</style>
