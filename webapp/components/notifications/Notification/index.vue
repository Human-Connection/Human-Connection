<template>
  <ds-space :class="{ notification: true, read: notification.read }" margin-bottom="x-small">
    <no-ssr>
      <ds-space margin-bottom="x-small">
        <hc-user :user="post.author" :date-time="post.createdAt" :trunc="35" />
      </ds-space>
      <ds-text color="soft">
        {{ $t('notifications.menu.mentioned') }}
      </ds-text>
    </no-ssr>
    <ds-space margin-bottom="x-small" />
    <nuxt-link
      class="notification-mention-post"
      :to="{ name: 'post-id-slug', params: { id: post.id, slug: post.slug } }"
      @click.native="$emit('read')"
    >
      <ds-space margin-bottom="x-small">
        <ds-card :header="post.title" :image="post.image" hover space="x-small">
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
      return this.$filters.removeLinks(this.post.contentExcerpt)
    },
    post() {
      return this.notification.post || {}
    },
  },
}
</script>

<style>
.notification.read {
  opacity: 0.6; /* Real browsers */
  filter: alpha(opacity = 60); /* MSIE */
}
</style>
