<template>
  <div id="comments" class="comment-list">
    <h3 class="title">
      <counter-icon icon="comments" :count="postComments.length" />
      {{ $t('common.comment', null, 0) }}
    </h3>
    <ds-space margin-bottom="large" />
    <div id="comments" class="comments">
      <comment
        v-for="comment in postComments"
        :key="comment.id"
        :comment="comment"
        :post="post"
        :routeHash="routeHash"
        class="comment-tag"
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
import Comment from '~/components/Comment/Comment'
import scrollToAnchor from '~/mixins/scrollToAnchor'

export default {
  mixins: [scrollToAnchor],
  components: {
    CounterIcon,
    Comment,
  },
  props: {
    routeHash: { type: String, default: () => '' },
    post: { type: Object, default: () => {} },
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
      this.postComments = this.postComments.map(comment => {
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
