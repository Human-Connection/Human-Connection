<template>
  <div id="comments">
    <h3 style="margin-top: -10px;">
      <span>
        <ds-icon name="comments"/>
        <ds-tag
          v-if="comments"
          style="margin-top: -4px; margin-left: -12px; position: absolute;"
          color="primary"
          size="small"
          round
        >{{ comments.length }}</ds-tag>&nbsp; Comments
      </span>
    </h3>
    <ds-space margin-bottom="large"/>
    <div v-if="comments && comments.length" id="comments" class="comments">
      <comment
        v-for="(comment, index) in comments"
        :key="comment.id"
        :comment="comment"
        :post="post"
        @deleteComment="comments.splice(index, 1)"
      />
    </div>
    <hc-empty v-else name="empty" icon="messages"/>
  </div>
</template>
<script>
import Comment from '~/components/Comment.vue'
import HcEmpty from '~/components/Empty.vue'
import PostCommentsQuery from '~/graphql/PostCommentsQuery.js'

export default {
  components: {
    Comment,
    HcEmpty,
  },
  props: {
    post: { type: Object, default: () => {} },
  },
  data() {
    return {
      comments: [],
    }
  },
  watch: {
    Post(post) {
      this.comments = post[0].comments || []
    },
  },
  apollo: {
    Post: {
      query() {
        return PostCommentsQuery(this.$i18n)
      },
      variables() {
        return {
          slug: this.post.slug,
        }
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
