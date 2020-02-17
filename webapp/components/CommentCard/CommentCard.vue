<template>
  <base-card v-if="isUnavailable" class="comment-card">
    <p>
      <base-icon name="ban" />
      {{ this.$t('comment.content.unavailable-placeholder') }}
    </p>
  </base-card>
  <base-card v-else :class="commentClass" :id="anchor">
    <header class="header">
      <user-teaser :user="comment.author" :date-time="comment.createdAt">
        <template v-if="wasEdited" #dateTime>
          <span>({{ $t('comment.edited') }})</span>
        </template>
      </user-teaser>
      <client-only>
        <content-menu
          v-show="!editingComment"
          placement="bottom-end"
          resource-type="comment"
          :resource="comment"
          :modalsData="menuModalsData"
          :is-owner="user.id === comment.author.id"
          @editComment="editComment(true)"
        />
      </client-only>
    </header>
    <comment-form
      v-if="editingComment"
      :update="true"
      :postId="postId"
      :comment="comment"
      @finishEditing="editComment(false)"
      @updateComment="updateComment"
      @collapse="isCollapsed = true"
    />
    <template v-else>
      <content-viewer :content="commentContent" class="content" />
      <base-button v-if="hasLongContent" size="small" ghost @click="isCollapsed = !isCollapsed">
        {{ isCollapsed ? $t('comment.show.more') : $t('comment.show.less') }}
      </base-button>
    </template>
    <base-button
      :title="this.$t('post.comment.reply')"
      icon="level-down"
      class="reply-button"
      circle
      size="small"
      v-scroll-to="'.editor'"
      @click="reply"
    />
  </base-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { COMMENT_MAX_UNTRUNCATED_LENGTH, COMMENT_TRUNCATE_TO_LENGTH } from '~/constants/comment'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import ContentMenu from '~/components/ContentMenu/ContentMenu'
import ContentViewer from '~/components/Editor/ContentViewer'
import CommentForm from '~/components/CommentForm/CommentForm'
import CommentMutations from '~/graphql/CommentMutations'
import scrollToAnchor from '~/mixins/scrollToAnchor.js'

export default {
  components: {
    UserTeaser,
    ContentMenu,
    ContentViewer,
    CommentForm,
  },
  mixins: [scrollToAnchor],
  data() {
    const anchor = `commentId-${this.comment.id}`
    const isTarget = this.$route.hash === `#${anchor}`

    return {
      anchor,
      isTarget,
      isCollapsed: !isTarget,
      editingComment: false,
    }
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
      isModerator: 'auth/isModerator',
    }),
    hasLongContent() {
      return this.$filters.removeHtml(this.comment.content).length > COMMENT_MAX_UNTRUNCATED_LENGTH
    },
    isUnavailable() {
      return (this.comment.deleted || this.comment.disabled) && !this.isModerator
    },
    wasEdited() {
      return this.comment.createdAt !== this.comment.updatedAt
    },
    commentClass() {
      let commentClass = 'comment-card'

      if (this.comment.deleted || this.comment.disabled) commentClass += ' disabled-content'
      if (this.isTarget) commentClass += ' --target'

      return commentClass
    },
    commentContent() {
      if (this.hasLongContent && this.isCollapsed) {
        return this.$filters.truncate(this.comment.content, COMMENT_TRUNCATE_TO_LENGTH)
      }

      return this.comment.content
    },
    menuModalsData() {
      return {
        delete: {
          titleIdent: 'delete.comment.title',
          messageIdent: 'delete.comment.message',
          messageParams: {
            name: this.$filters.truncate(this.comment.contentExcerpt, 30),
          },
          buttons: {
            confirm: {
              danger: true,
              icon: 'trash',
              textIdent: 'delete.submit',
              callback: this.deleteCommentCallback,
            },
            cancel: {
              icon: 'close',
              textIdent: 'delete.cancel',
              callback: () => {},
            },
          },
        },
      }
    },
  },
  methods: {
    checkAnchor(anchor) {
      return `#${this.anchor}` === anchor
    },
    reply() {
      const message = { slug: this.comment.author.slug, id: this.comment.author.id }
      this.$emit('reply', message)
    },
    editComment(editing) {
      this.editingComment = editing
      this.$emit('toggleNewCommentForm', !editing)
    },
    updateComment(comment) {
      this.$emit('updateComment', comment)
    },
    async deleteCommentCallback() {
      try {
        const {
          data: { DeleteComment },
        } = await this.$apollo.mutate({
          mutation: CommentMutations(this.$i18n).DeleteComment,
          variables: { id: this.comment.id },
        })
        this.$toast.success(this.$t(`delete.comment.success`))
        this.$emit('deleteComment', DeleteComment)
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
<style lang="scss">
.comment-card {
  display: flex;
  flex-direction: column;
  margin-bottom: $space-small;

  &.--target {
    animation: highlight 4s ease;
  }

  > .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: $space-small;
  }

  > .base-button {
    align-self: flex-end;
  }
}

.reply-button {
  float: right;
  top: 0px;
}
.reply-button:after {
  clear: both;
}

@keyframes highlight {
  0% {
    border: $border-size-base solid $color-primary;
  }
  100% {
    border: $border-size-base solid transparent;
  }
}
</style>
