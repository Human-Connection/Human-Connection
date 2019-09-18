<template>
  <div id="comments">
    <h3 style="margin-top: -10px;">
      <span>
        <ds-icon name="comments" />
        <ds-tag
          v-if="post.comments.length"
          style="margin-top: -4px; margin-left: -12px; position: absolute;"
          color="primary"
          size="small"
          round
        >
          {{ post.comments.length }}
        </ds-tag>
        &nbsp; Comments
      </span>
    </h3>
    <ds-space margin-bottom="large" />
    <div v-if="post.comments && post.comments.length" id="comments">
      <comment
        v-for="comment in post.comments"
        :key="comment.id"
        :comment="comment"
        :post="post"
        @deleteComment="updateCommentList"
        @updateComment="updateCommentList"
      />
    </div>
    <hc-empty v-else name="empty" icon="messages" />
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
  methods: {
    updateCommentList(updatedComment) {
      this.post.comments = this.post.comments.map(comment => {
        return comment.id === updatedComment.id ? updatedComment : comment
      })
    },
  },
}
</script>
