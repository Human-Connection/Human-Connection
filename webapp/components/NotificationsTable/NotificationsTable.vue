<template>
  <ds-table v-if="notifications && notifications.length" :data="notifications" :fields="fields">
    <template #icon="scope">
      <base-icon
        v-if="isModeration(scope.row)"
        name="balance-scale"
        v-tooltip="{ content: $t('notifications.moderation'), placement: 'right' }"
      />
      <base-icon
        v-else-if="isComment(scope.row)"
        name="comment"
        v-tooltip="{ content: $t('notifications.comment'), placement: 'right' }"
      />
      <base-icon
        v-else
        name="bookmark"
        v-tooltip="{ content: $t('notifications.post'), placement: 'right' }"
      />
    </template>
    <template #user="scope">
      <ds-space margin-bottom="base">
        <client-only>
          <user-teaser
            :user="scope.row.from.author"
            :date-time="scope.row.from.createdAt"
            :class="{ 'notification-status': scope.row.read }"
          />
        </client-only>
      </ds-space>
      <ds-text :class="{ 'notification-status': scope.row.read, reason: true }">
        {{ notificationReason(scope.row) }}
      </ds-text>
    </template>
    <template #post="scope">
      <nuxt-link
        class="notification-mention-post"
        :class="{ 'notification-status': scope.row.read }"
        :to="{
          name: 'post-id-slug',
          params: params(scope.row),
          hash: hashParam(scope.row),
        }"
        @click.native="markNotificationAsRead(scope.row.from.id)"
      >
        <b>{{ scope.row.from.title || scope.row.from.post.title | truncate(50) }}</b>
      </nuxt-link>
    </template>
    <template #content="scope">
      <b :class="{ 'notification-status': scope.row.read }">
        {{ scope.row.from.contentExcerpt | removeHtml }}
      </b>
    </template>
  </ds-table>
  <hc-empty v-else icon="alert" :message="$t('notifications.empty')" />
</template>
<script>
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import HcEmpty from '~/components/Empty/Empty'

export default {
  components: {
    UserTeaser,
    HcEmpty,
  },
  props: {
    notifications: { type: Array, default: () => [] },
  },
  computed: {
    fields() {
      return {
        icon: {
          label: ' ',
          width: '5',
        },
        user: {
          label: this.$t('notifications.user'),
          width: '45%',
        },
        post: {
          label: this.$t('notifications.post'),
          width: '25%',
        },
        content: {
          label: this.$t('notifications.content'),
          width: '25%',
        },
      }
    },
  },
  methods: {
    notificationReason(notification) {
      const resourceType = this.isComment(notification)
        ? this.$t('notifications.comment')
        : this.$t('notifications.post')
      return this.$t(`notifications.reason.${notification.reason}`, { resourceType })
    },
    isModeration(notification) {
      return ['moderation_disabled', 'moderation_enabled'].includes(notification.reason)
    },
    isComment({ from }) {
      return from.__typename === 'Comment'
    },
    params({ from }) {
      const post = this.isComment({ from }) ? from.post : from
      return {
        id: post.id,
        slug: post.slug,
      }
    },
    hashParam({ from }) {
      return this.isComment({ from }) ? `#commentId-${from.id}` : ''
    },
    markNotificationAsRead(notificationSourceId) {
      this.$emit('markNotificationAsRead', notificationSourceId)
    },
  },
}
</script>
<style lang="scss">
.notification-status {
  opacity: $opacity-soft;
}
</style>
