<template>
  <div>
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
  mounted() {
    this.$root.$on('refetchPostComments', () => {
      this.refetchPostComments()
    })
  },
  methods: {
    refetchPostComments() {
      if (this.$apollo.queries.Post) {
        this.$apollo.queries.Post.refetch()
      }
    },
  },
  apollo: {
    Post: {
      query() {
        return require('~/graphql/PostCommentsQuery.js').default(this)
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
