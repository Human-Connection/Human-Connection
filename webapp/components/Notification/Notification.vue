<template>
  <ds-space :class="{ read: notification.read, notification: true }" margin-bottom="x-small">
    <client-only>
      <ds-space margin-bottom="x-small">
        <hc-user :user="sourceData.triggerer" :date-time="sourceData.createdAt" :trunc="35" />
      </ds-space>
      <ds-text class="reason-text-for-test" color="soft">
        {{ $t(`notifications.reason.${notification.reason}` + sourceData.reasonExtention) }}
      </ds-text>
    </client-only>
    <ds-space margin-bottom="x-small" />
    <nuxt-link class="notification-mention-post" :to="linkTo" @click.native="$emit('read')">
      <ds-space margin-bottom="x-small">
        <ds-card :header="sourceData.title" hover space="x-small" class="notifications-card">
          <ds-space margin-bottom="x-small" />
          <div v-if="sourceData.user">
            <hc-user :user="sourceData.user" :trunc="35" />
          </div>
          <div v-else-if="sourceData.contentExcerpt">
            <span v-if="sourceData.comment" class="text-notification-header">
              {{ $t(`notifications.comment`) }}:
            </span>
            {{ sourceData.contentExcerpt | removeHtml }}
          </div>
          <div v-if="sourceData.report">
            <ds-space margin-bottom="x-small" />
            <span class="text-notification-header">
              {{ $t(`notifications.filedReport.category`) }}:
            </span>
            {{ this.$t('report.reason.category.options.' + sourceData.report.reasonCategory) }}
            <br />
            <span class="text-notification-header">
              {{ $t(`notifications.filedReport.description`) }}:
            </span>
            <span
              v-if="
                sourceData.report.reasonDescription && sourceData.report.reasonDescription !== ''
              "
            >
              {{ sourceData.report.reasonDescription }}
            </span>
            <span v-else>
              —
            </span>
          </div>
        </ds-card>
      </ds-space>
    </nuxt-link>
  </ds-space>
</template>

<script>
import { mapGetters } from 'vuex'
import HcUser from '~/components/User/User'

export default {
  name: 'Notification',
  components: {
    HcUser,
  },
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    sourceData() {
      const from = this.notification.from
      let triggerer
      const createdAt = this.notification.createdAt
      let title
      let author
      let user = null
      let post = null
      let comment = null
      let contentExcerpt = null
      let report = null
      let reasonExtention = ''

      if (from.__typename === 'Post') {
        post = from
        triggerer = post.author
      } else if (from.__typename === 'Comment') {
        comment = from
        triggerer = comment.author
        post = comment.post
      } else if (from.__typename === 'Report') {
        report = {
          reasonCategory: from.filed[0].reasonCategory,
          reasonDescription: from.filed[0].reasonDescription,
        }
        triggerer = this.currentUser
        if (from.filed[0].reportedResource.__typename === 'User') {
          user = from.filed[0].reportedResource
          reasonExtention = '.user'
        } else if (from.filed[0].reportedResource.__typename === 'Post') {
          post = from.filed[0].reportedResource
          reasonExtention = '.post'
        } else if (from.filed[0].reportedResource.__typename === 'Comment') {
          comment = from.filed[0].reportedResource
          post = from.filed[0].reportedResource.post
          reasonExtention = '.comment'
        }
      }

      if (user) {
        title = user.name
        author = user
      } else {
        title = post.title
        if (comment) {
          author = comment.author
          contentExcerpt = comment.contentExcerpt
        } else {
          author = post.author
          contentExcerpt = post.contentExcerpt
        }
      }

      const data = {
        triggerer,
        createdAt,
        title,
        user,
        post,
        comment,
        contentExcerpt,
        author,
        report,
        reasonExtention,
      }
      return data
    },
    linkTo() {
      const params = this.sourceData.user
        ? {
            id: this.sourceData.user.id,
            slug: this.sourceData.user.slug,
          }
        : this.sourceData.post
        ? {
            id: this.sourceData.post.id,
            slug: this.sourceData.post.slug,
          }
        : {}
      const hashParam = this.sourceData.comment
        ? { hash: `#commentId-${this.sourceData.comment.id}` }
        : {}
      return {
        name: this.sourceData.user ? 'profile-id-slug' : 'post-id-slug',
        params,
        ...hashParam,
      }
    },
  },
}
</script>

<style lang="scss">
.notification.read {
  opacity: $opacity-soft;
}
.notifications-card {
  min-width: 500px;
}
.text-notification-header {
  font-weight: 700;
  margin-right: 0.1rem;
}
</style>
