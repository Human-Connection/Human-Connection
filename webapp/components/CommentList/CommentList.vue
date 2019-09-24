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
    scrollCommentsIntoView() {
      if (!window || !document) {
        return
      }
      const container = document.getElementById('comments')
      if (container) {
        const top = container.offsetTop
        window.scroll({
          top,
          left: 0,
          behavior: 'smooth',
        })
      }
    },
  },
  watch: {
    $route(to, from) {
      // scroll inside the same page
      if (to.hash === '#comments') {
        this.scrollCommentsIntoView()
      }
    },
  },
  mounted() {
    if (this.$route.hash === '#comments') {
      setTimeout(this.scrollCommentsIntoView, 250)
    }
  },
}
</script>
