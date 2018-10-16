<template>
  <a
    v-router-link
    :href="href(post)"
  >
    <ds-card
      :header="post.title"
      :image="post.image"
      style="cursor: pointer; position: relative;">
      <div v-html="post.contentExcerpt" />
      <ds-space />
      <ds-space
        margin="small"
        style="position: absolute; bottom: 44px;">
        <hc-author
          :post="post"
          :trunc="35"
          :show-author-popover="showAuthorPopover" />
      </ds-space>
      <template slot="footer">
        <span :style="{ opacity: post.shoutedCount ? 1 : .5 }">
          <ds-icon name="heart-o" /> <small>{{ post.shoutedCount }}</small>
        </span>
        &nbsp;
        <span :style="{ opacity: post.commentsCount ? 1 : .5 }">
          <ds-icon name="comments" /> <small>{{ post.commentsCount }}</small>
        </span>
      </template>
    </ds-card>
  </a>
</template>

<script>
import HcAuthor from '~/components/Author.vue'

export default {
  name: 'HcPostCard',
  components: {
    HcAuthor
  },
  props: {
    post: {
      type: Object,
      required: true
    },
    showAuthorPopover: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    href(post) {
      return this.$router.resolve({
        name: 'post-slug',
        params: { slug: post.slug }
      }).href
    }
  }
}
</script>
