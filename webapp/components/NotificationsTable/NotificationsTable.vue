<template>
  <ds-table v-if="notifications && notifications.length" :data="notifications" :fields="fields">
    <template slot="icon" slot-scope="scope">
      <ds-icon
        v-if="scope.row.from.post"
        name="comment"
        v-tooltip="{ content: $t('notifications.comment'), placement: 'right' }"
      />
      <ds-icon
        v-else
        name="bookmark"
        v-tooltip="{ content: $t('notifications.post'), placement: 'right' }"
      />
    </template>
    <template slot="user" slot-scope="scope">
      <ds-space margin-bottom="base">
        <client-only>
          <hc-user
            :user="scope.row.from.author"
            :date-time="scope.row.from.createdAt"
            :trunc="35"
            :class="{ 'notification-status': scope.row.read }"
          />
        </client-only>
      </ds-space>
      <ds-text :class="{ 'notification-status': scope.row.read }">
        {{ $t(`notifications.reason.${scope.row.reason}`) }}
      </ds-text>
    </template>
    <template slot="post" slot-scope="scope">
      <nuxt-link
        class="notification-mention-post"
        :class="{ 'notification-status': scope.row.read }"
        :to="{
          name: 'post-id-slug',
          params: params(scope.row.from),
          hash: hashParam(scope.row.from),
        }"
        @click.native="markNotificationAsRead(scope.row.from.id)"
      >
        <b>{{ scope.row.from.title || scope.row.from.post.title | truncate(50) }}</b>
      </nuxt-link>
    </template>
    <template slot="content" slot-scope="scope">
      <b :class="{ 'notification-status': scope.row.read }">
        {{ scope.row.from.contentExcerpt || scope.row.from.contentExcerpt | removeHtml }}
      </b>
    </template>
  </ds-table>
  <hc-empty v-else icon="alert" :message="$t('notifications.empty')" />
</template>
<script>
import HcUser from '~/components/User/User'
import HcEmpty from '~/components/Empty/Empty'

export default {
  components: {
    HcUser,
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
          width: '60px',
        },
        user: {
          label: this.$t('notifications.user'),
          width: '33.333%',
        },
        post: this.$t('notifications.post'),
        content: this.$t('notifications.content'),
      }
    },
  },
  methods: {
    isComment(notificationSource) {
      return notificationSource.__typename === 'Comment'
    },
    params(notificationSource) {
      const post = this.isComment(notificationSource) ? notificationSource.post : notificationSource
      return {
        id: post.id,
        slug: post.slug,
      }
    },
    hashParam(notificationSource) {
      return this.isComment(notificationSource) ? `#commentId-${notificationSource.id}` : ''
    },
    markNotificationAsRead(notificationSourceId) {
      this.$emit('markNotificationAsRead', notificationSourceId)
    },
  },
}
</script>
<style lang="scss">
.notification-status {
  opacity: 0.6; /* Real browsers */
  filter: alpha(opacity = 60); /* MSIE */
}
</style>
