<template>
  <div v-if="(comment.deleted || comment.disabled) && !isModerator">
    <ds-text style="padding-left: 40px; font-weight: bold;" color="soft">
      <ds-icon name="ban" />
      {{ this.$t('comment.content.unavailable-placeholder') }}
    </ds-text>
  </div>
  <div v-else :class="{ comment: true, 'disabled-content': comment.deleted || comment.disabled }">
    <ds-space margin-bottom="x-small">
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
      />
    </no-ssr>
    <!-- eslint-disable vue/no-v-html -->
    <!-- TODO: replace editor content with tiptap render view -->
    <ds-space margin-bottom="small" />
    <div style="padding-left: 40px;" v-html="comment.contentExcerpt" />
    <!-- eslint-enable vue/no-v-html -->
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'
import HcUser from '~/components/User'
import ContentMenu from '~/components/ContentMenu'

export default {
  components: {
    HcUser,
    ContentMenu,
  },
  props: {
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
    isAuthor(id) {
      return this.user.id === id
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
