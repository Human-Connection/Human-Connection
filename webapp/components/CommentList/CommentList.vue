<template>
  <div id="comments" class="comment-list">
    <h3 class="title">
      <counter-icon icon="comments" :count="postComments.length" />
      {{ $t('common.comment', null, 0) }}
    </h3>
    <div v-if="postComments" id="comments" class="comments">
      <comment-card
        v-for="comment in postComments"
        :key="comment.id"
        :comment="comment"
        :postId="post.id"
        @deleteComment="updateCommentList"
        @updateComment="updateCommentList"
        @toggleNewCommentForm="toggleNewCommentForm"
        @reply="reply"
      />
    </div>
  </div>
</template>
<script>
import CounterIcon from '~/components/_new/generic/CounterIcon/CounterIcon'
import CommentCard from '~/components/CommentCard/CommentCard'
import scrollToAnchor from '~/mixins/scrollToAnchor'

export default {
  mixins: [scrollToAnchor],
  components: {
    CounterIcon,
    CommentCard,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  computed: {
    postComments() {
      return (this.post && this.post.comments) || []
    },
  },
  methods: {
    reply(message) {
      this.$emit('reply', message)
    },
    checkAnchor(anchor) {
      return anchor === '#comments'
    },
    updateCommentList(updatedComment) {
      this.post.comments = this.postComments.map((comment) => {
        return comment.id === updatedComment.id ? updatedComment : comment
      })
    },
    toggleNewCommentForm(showNewCommentForm) {
      this.$emit('toggleNewCommentForm', showNewCommentForm)
    },
  },
}
</script>

<style lang="scss">
.comment-list {
  > .title {
    margin-top: 0;

    > .counter-icon {
      margin-right: $space-small;
    }
  }
}
</style>
