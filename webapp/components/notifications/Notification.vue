<template>
  <nuxt-link
    :to="{ name: 'post-id-slug', params: { id: post.id, slug: post.slug } }"
    @click.native="$emit('read')"
  >
    <hc-post-card :post="post" />
  </nuxt-link>
</template>

<script>
import HcPostCard from '~/components/PostCard.vue'

export default {
  name: 'Notification',
  components: {
    HcPostCard
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
