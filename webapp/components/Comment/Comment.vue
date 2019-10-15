<template>
  <div v-if="(comment.deleted || comment.disabled) && !isModerator" :class="{ comment: true }">
    <ds-card>
      <ds-space margin-bottom="base" />
      <ds-text style="padding-left: 40px; font-weight: bold;" color="soft">
        <ds-icon name="ban" />
        {{ this.$t('comment.content.unavailable-placeholder') }}
      </ds-text>
      <ds-space margin-bottom="base" />
    </ds-card>
  </div>
  <div v-else :class="{ comment: true, 'disabled-content': comment.deleted || comment.disabled }">
    <ds-card :id="anchor" :class="{ 'comment--target': isTarget }">
      <ds-space margin-bottom="small" margin-top="small">
        <hc-user :user="author" :date-time="comment.createdAt">
          <template v-slot:dateTime>
            <ds-text v-if="comment.createdAt !== comment.updatedAt">
              ({{ $t('comment.edited') }})
            </ds-text>
          </template>
        </hc-user>
        <client-only>
          <content-menu
            v-show="!openEditCommentMenu"
            placement="bottom-end"
            resource-type="comment"
            :resource="comment"
            :modalsData="menuModalsData"
            class="float-right"
            :is-owner="isAuthor(author.id)"
            @showEditCommentMenu="editCommentMenu"
          />
        </client-only>
      </ds-space>
      <div v-if="openEditCommentMenu">
        <hc-comment-form
          :update="true"
          :post="post"
          :comment="comment"
          @showEditCommentMenu="editCommentMenu"
          @updateComment="updateComment"
          @collapse="isCollapsed = true"
        />
      </div>
      <div v-else>
        <content-viewer :content="commentContent" class="comment-content" />
        <button
          v-if="isLongComment"
          type="button"
          class="collapse-button"
          @click="isCollapsed = !isCollapsed"
        >
          {{ isCollapsed ? $t('comment.show.more') : $t('comment.show.less') }}
        </button>
      </div>
      <ds-space margin-bottom="small" />
    </ds-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import HcUser from '~/components/User/User'
import ContentMenu from '~/components/ContentMenu'
import ContentViewer from '~/components/Editor/ContentViewer'
import HcCommentForm from '~/components/CommentForm/CommentForm'
import CommentMutations from '~/graphql/CommentMutations'
import scrollToAnchor from '~/mixins/scrollToAnchor.js'

export default {
  mixins: [scrollToAnchor],
  data() {
    const anchor = `commentId-${this.comment.id}`
    const isTarget = this.routeHash === `#${anchor}`

    return {
      anchor,
      isTarget,
      isCollapsed: !isTarget,
      openEditCommentMenu: false,
    }
  },
  components: {
    HcUser,
    ContentMenu,
    ContentViewer,
    HcCommentForm,
  },
  props: {
    routeHash: { type: String, default: () => '' },
    post: { type: Object, default: () => ({}) },
    comment: { type: Object, default: () => ({}) },
    dateTime: { type: [Date, String], default: null },
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
      isModerator: 'auth/isModerator',
    }),
    isLongComment() {
      return this.$filters.removeHtml(this.comment.content).length > 180
    },
    commentContent() {
      if (this.isLongComment && this.isCollapsed) {
        return this.$filters.truncate(this.comment.content, 180)
      }

      return this.comment.content
    },
    displaysComment() {
      return !this.unavailable || this.isModerator
    },
    author() {
      if (this.deleted) return {}
      return this.comment.author || {}
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
    isAuthor(id) {
      return this.user.id === id
    },
    editCommentMenu(showMenu) {
      this.openEditCommentMenu = showMenu
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
<style lang="scss" scoped>
.collapse-button {
  // TODO: move this to css resets
  font-family: inherit;
  font-size: inherit;
  border: none;
  background-color: transparent;

  float: right;
  padding: 0 16px 16px 16px;
  color: $color-primary;
  cursor: pointer;
}

.comment-content {
  padding-left: 40px;
}

.float-right {
  float: right;
}

@keyframes highlight {
  0% {
    border: 1px solid $color-primary;
  }
  100% {
    border: 1px solid transparent;
  }
}

.comment--target {
  animation: highlight 4s ease;
}
</style>
