<template>
  <div :class="{'comment': true, 'disabled-content': (deleted && isModerator)}">
    <div v-if="displaysComment">
      <ds-space
        margin-bottom="x-small"
      >
        <hc-user :user="author" />
      </ds-space>
      <no-ssr>
        <content-menu
          placement="bottom-end"
          resource-type="comment"
          style="float-right"
          :item-id="comment.id"
          :is-owner="isAuthor(author.id)"
        />
      </no-ssr>
      <!-- eslint-disable vue/no-v-html -->
      <!-- TODO: replace editor content with tiptap render view -->
      <ds-space margin-bottom="small" />
      <div
        style="padding-left: 40px;"
        v-html="comment.contentExcerpt"
      />
    </div>
    <!-- eslint-enable vue/no-v-html -->
    <ds-text
      v-else
      style="padding-left: 40px; font-weight: bold;"
      color="soft"
    >
      <ds-icon name="ban" /> {{ this.$t('comment.content.unavailable-placeholder') }}
    </ds-text>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import HcUser from '~/components/User.vue'
import ContentMenu from '~/components/ContentMenu'

export default {
  components: {
    HcUser,
    ContentMenu
  },
  props: {
    comment: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
      isModerator: 'auth/isModerator'
    }),
    deleted() {
      const { disabled, deleted } = this.comment
      return disabled || deleted
    },
    displaysComment() {
      return !this.deleted || this.isModerator
    },
    author() {
      if (this.deleted) return {}
      return this.comment.author || {}
    }
  },
  methods: {
    isAuthor(id) {
      return this.user.id === id
    }
  }
}
</script>
