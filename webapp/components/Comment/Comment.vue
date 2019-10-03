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
    <ds-card :id="anchor">
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
        <content-viewer
          v-if="$filters.removeHtml(comment.content).length < 180"
          :content="comment.content"
          class="padding-left"
        />
        <div v-else class="show-more-or-less-div">
          <content-viewer
            v-if="isCollapsed"
            :content="$filters.truncate(comment.content, 180)"
            class="padding-left text-align-left"
          />
          <span class="show-more-or-less">
            <a v-if="isCollapsed" class="padding-left" @click="isCollapsed = !isCollapsed">
              {{ $t('comment.show.more') }}
            </a>
          </span>
        </div>
        <content-viewer
          v-if="!isCollapsed"
          :content="comment.content"
          class="padding-left text-align-left"
        />
        <div class="show-more-or-less-div">
          <span class="show-more-or-less">
            <a v-if="!isCollapsed" class="padding-left" @click="isCollapsed = !isCollapsed">
              {{ $t('comment.show.less') }}
            </a>
          </span>
        </div>
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
    HcCommentForm,
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
    anchor() {
      return `commentId-${this.comment.id}`
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
.float-right {
  float: right;
}

.padding-left {
  padding-left: 40px;
}

.text-align-left {
  text-align: left;
}

div.show-more-or-less-div {
  text-align: right;
  margin-right: 20px;
}

span.show-more-or-less {
  display: block;
  margin: 0px 20px;
  cursor: pointer;
}
</style>
