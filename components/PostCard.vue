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
        <ds-avatar
          :image="post.author.User.avatar"
          size="32px" /> <b class="username">{{ post.author.User.name }}</b>
      </ds-space>
      <template slot="footer">
        <span>
          <ds-icon name="comments" /> <small v-if="post.commentsCount">{{ post.commentsCount }}</small>
        </span>
        &nbsp;
        <span>
          <ds-icon name="heart-o" /> <small v-if="post.shoutedCount">{{ post.shoutedCount }}</small>
        </span>
      </template>
    </ds-card>
  </a>
</template>

<script>
/**
 * TODO: we have to check if the user is already following
 */
export default {
  name: 'HcPostCard',
  props: {
    post: {
      type: Object,
      required: true
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
