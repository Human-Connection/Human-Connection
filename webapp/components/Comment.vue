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
    <ds-card>
      <ds-space margin-bottom="small">
        <hc-user :user="author" :date-time="comment.createdAt" />
      </ds-space>
      <!-- Content Menu (can open Modals) -->
      <no-ssr>
        <content-menu
          placement="bottom-end"
          resource-type="comment"
          :resource="comment"
          :modalsData="menuModalsData"
          style="float-right"
          :is-owner="isAuthor(author.id)"
          @showEditCommentMenu="editCommentMenu"
        />
      </no-ssr>

      <ds-space margin-bottom="small" />
      <div v-if="openEditCommentMenu">
        <hc-edit-comment-form
          :comment="comment"
          :post="post"
          @showEditCommentMenu="editCommentMenu"
        />
      </div>
      <div v-show="!openEditCommentMenu">
        <div v-if="isCollapsed" v-html="comment.contentExcerpt" style="padding-left: 40px;" />
        <div
          v-show="comment.content !== comment.contentExcerpt"
          style="text-align: right;  margin-right: 20px; margin-top: -12px;"
        >
          <a v-if="isCollapsed" style="padding-left: 40px;" @click="isCollapsed = !isCollapsed">
            {{ $t('comment.show.more') }}
          </a>
        </div>
        <content-viewer
          v-if="!isCollapsed"
          :content="comment.content"
          style="padding-left: 40px;"
        />
        <div style="text-align: right;  margin-right: 20px; margin-top: -12px;">
          <a v-if="!isCollapsed" @click="isCollapsed = !isCollapsed" style="padding-left: 40px; ">
            {{ $t('comment.show.less') }}
          </a>
        </div>
      </div>
      <ds-space margin-bottom="small" />
    </ds-card>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters, mapMutations } from 'vuex'
import HcUser from '~/components/User'
import ContentMenu from '~/components/ContentMenu'
import ContentViewer from '~/components/Editor/ContentViewer'
import HcEditCommentForm from '~/components/comments/EditCommentForm/EditCommentForm'

export default {
  data: function() {
    return {
      isCollapsed: true,
      openEditCommentMenu: false,
    }
  },
  components: {
    HcUser,
    ContentMenu,
    ContentViewer,
    HcEditCommentForm,
  },
  props: {
    post: { type: Object, default: () => {} },
    comment: {
      type: Object,
      default() {
        return {}
      },
    },
    dateTime: { type: [Date, String], default: null },
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
      isModerator: 'auth/isModerator',
    }),
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
    ...mapMutations({
      setEditPending: 'editor/SET_EDIT_PENDING',
    }),
    isAuthor(id) {
      return this.user.id === id
    },
    editCommentMenu(showMenu) {
      this.openEditCommentMenu = showMenu
      this.setEditPending(showMenu)
    },
    async deleteCommentCallback() {
      try {
        var gqlMutation = gql`
          mutation($id: ID!) {
            DeleteComment(id: $id) {
              id
            }
          }
        `
        await this.$apollo.mutate({
          mutation: gqlMutation,
          variables: { id: this.comment.id },
        })
        this.$toast.success(this.$t(`delete.comment.success`))
        this.$emit('deleteComment')
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
