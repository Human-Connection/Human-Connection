<template>
  <nuxt-link
    :to="{ name: 'post-id-slug', params: { id: post.id, slug: post.slug } }"
    @click.native="$emit('read')"
  >
    <ds-space margin-bottom="x-small">
      <hc-notification-post-card :post="post" />
    </ds-space>
  </nuxt-link>
</template>

<script>
import HcNotificationPostCard from './NotificationPostCard.vue'

export default {
  name: 'Notification',
  components: {
    HcNotificationPostCard
  },
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  computed: {
    post() {
      return this.notification.post
    }
  }
}
</script>
