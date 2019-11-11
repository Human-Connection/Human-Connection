<template>
  <ds-button v-if="!notifications.length" class="notifications-menu" disabled icon="bell">
    {{ unreadNotificationsCount }}
  </ds-button>
  <dropdown v-else class="notifications-menu" offset="8" :placement="placement">
    <template slot="default" slot-scope="{ toggleMenu }">
      <ds-button :primary="!!unreadNotificationsCount" icon="bell" @click.prevent="toggleMenu">
        {{ unreadNotificationsCount }}
      </ds-button>
    </template>
    <template slot="popover">
      <div class="notifications-menu-popover">
        <notification-list :notifications="notifications" @markAsRead="markAsRead" />
      </div>
      <div class="notifications-link-container">
        <nuxt-link :to="{ name: 'notifications' }">
          {{ $t('notifications.pageLink') }}
        </nuxt-link>
      </div>
    </template>
  </dropdown>
</template>

<script>
import Dropdown from '~/components/Dropdown'
import { NOTIFICATIONS_POLL_INTERVAL } from '~/constants/notifications'
import { notificationQuery, markAsReadMutation } from '~/graphql/User'
import NotificationList from '../NotificationList/NotificationList'
import unionBy from 'lodash/unionBy'

export default {
  name: 'NotificationMenu',
  components: {
    NotificationList,
    Dropdown,
  },
  data() {
    return {
      notifications: [],
    }
  },
  props: {
    placement: { type: String },
  },
  methods: {
    async markAsRead(notificationSourceId) {
      const variables = { id: notificationSourceId }
      try {
        await this.$apollo.mutate({
          mutation: markAsReadMutation(this.$i18n),
          variables,
        })
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
  computed: {
    unreadNotificationsCount() {
      const result = this.notifications.reduce((count, notification) => {
        return notification.read ? count : count + 1
      }, 0)
      return result
    },
  },
  apollo: {
    notifications: {
      query() {
        return notificationQuery(this.$i18n)
      },
      variables() {
        return {
          read: false,
          orderBy: 'updatedAt_desc',
        }
      },
      pollInterval: NOTIFICATIONS_POLL_INTERVAL,
      update({ notifications }) {
        return unionBy(notifications, this.notifications, notification => notification.id).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        )
      },
      error(error) {
        this.$toast.error(error.message)
      },
    },
  },
}
</script>

<style lang="scss">
.notifications-menu {
  display: flex;
  align-items: center;
}

.notifications-menu-popover {
  max-width: 500px;
  margin-bottom: $size-height-base;
}
.notifications-link-container {
  background-color: $background-color-softer-active;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: $size-height-base;
  padding: $space-x-small;
}
</style>
