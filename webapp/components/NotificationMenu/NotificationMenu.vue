<template>
  <ds-button v-if="!notificationsCount" class="notifications-menu" disabled icon="bell">
    {{ unreadNotificationsCount }}
  </ds-button>
  <dropdown v-else class="notifications-menu" :placement="placement">
    <template slot="default" slot-scope="{ toggleMenu }">
      <ds-button :primary="!!unreadNotificationsCount" icon="bell" @click.prevent="toggleMenu">
        {{ unreadNotificationsCount }}
      </ds-button>
    </template>
    <template slot="popover">
      <div class="notifications-menu-popover">
        <notification-list :notifications="displayedNotifications" @markAsRead="markAsRead" />
      </div>
      <ds-space centered>
        <nuxt-link to="/notifications">
          {{ $t('notifications.page') }}
        </nuxt-link>
      </ds-space>
    </template>
  </dropdown>
</template>

<script>
import Dropdown from '~/components/Dropdown'
import { NOTIFICATIONS_POLL_INTERVAL } from '~/constants/notifications'
import { notificationQuery, markAsReadMutation } from '~/graphql/User'
import NotificationList from '../NotificationList/NotificationList'

export default {
  name: 'NotificationMenu',
  components: {
    NotificationList,
    Dropdown,
  },
  data() {
    return {
      displayedNotifications: [],
      notifications: [],
      nofiticationRead: null,
    }
  },
  props: {
    placement: { type: String },
  },
  methods: {
    async markAsRead(notificationSourceId) {
      const variables = { id: notificationSourceId }
      try {
        const {
          data: { markAsRead },
        } = await this.$apollo.mutate({
          mutation: markAsReadMutation(this.$i18n),
          variables,
        })
        if (!(markAsRead && markAsRead.read === true)) return
        this.displayedNotifications = this.displayedNotifications.map(n => {
          return this.equalNotification(n, markAsRead) ? markAsRead : n
        })
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    equalNotification(a, b) {
      return a.from.id === b.from.id && a.createdAt === b.createdAt && a.reason === b.reason
    },
  },
  computed: {
    notificationsCount() {
      return (this.displayedNotifications || []).length
    },
    unreadNotificationsCount() {
      let countUnread = 0
      if (this.displayedNotifications) {
        this.displayedNotifications.forEach(notification => {
          if (!notification.read) countUnread++
        })
      }
      return countUnread
    },
    updateNotifications() {
      return this.notificationRead
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
        const newNotifications = notifications.filter(newN => {
          return !this.displayedNotifications.find(oldN => this.equalNotification(newN, oldN))
        })
        this.displayedNotifications = newNotifications
          .concat(this.displayedNotifications)
          .sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt)
          })
        return notifications
      },
      error(error) {
        this.$toast.error(error.message)
      },
    },
  },
}
</script>

<style>
.notifications-menu {
  display: flex;
  align-items: center;
}

.notifications-menu-popover {
  max-width: 500px;
}
</style>
