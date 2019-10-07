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
        <span class="list-title">{{ $t('common.comment', null, 0) }}</span>
      </span>
    </h3>
    <ds-space margin-bottom="large" />
    <div v-if="post.comments && post.comments.length" id="comments" class="comments">
      <comment
        v-for="comment in post.comments"
        :key="comment.id"
        :comment="comment"
        :post="post"
        @deleteComment="updateCommentList"
        @updateComment="updateCommentList"
      />
    </div>
  </div>
</template>
<script>
import Comment from '~/components/Comment/Comment'
import scrollToAnchor from '~/mixins/scrollToAnchor'

export default {
  mixins: [scrollToAnchor],
  components: {
    Comment,
  },
  props: {
    post: { type: Object, default: () => {} },
  },
  methods: {
    checkAnchor(anchor) {
      return anchor === '#comments'
    },
    updateCommentList(updatedComment) {
      this.post.comments = this.post.comments.map(comment => {
        return comment.id === updatedComment.id ? updatedComment : comment
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.list-title {
  margin-left: $space-x-small;
}
</style>
