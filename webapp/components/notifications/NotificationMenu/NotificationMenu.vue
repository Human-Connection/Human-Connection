<template>
  <div @mouseover="hoverUpdate" @mouseleave="hover = false">
    <div
      v-if="totalNotificationsCount === 0"
      class="notifications-menu-pointer"
      @click.prevent="updateNotifications"
    >
      <ds-button class="notifications-menu" disabled icon="bell">
        {{ unreadNotificationsCount }}
      </ds-button>
    </div>
    <dropdown v-else class="notifications-menu" :placement="placement">
      <template slot="default" slot-scope="{ toggleMenu }">
        <ds-button primary icon="bell" @click.prevent="callToggleMenu(toggleMenu)">
          {{ unreadNotificationsCount }}
        </ds-button>
      </template>
      <template slot="popover">
        <div class="notifications-menu-popover">
          <notification-list :notifications="displayedNotifications" @markAsRead="markAsRead" />
        </div>
      </template>
    </dropdown>
  </div>
</template>

<script>
import Dropdown from '~/components/Dropdown'
import {
  NOTIFICATIONS_POLL_INTERVAL,
  NOTIFICATIONS_CHECK_UPDATED_INTERVAL,
  NOTIFICATIONS_MENU_OPEN_LATEST_INTERVAL,
  NOTIFICATIONS_UPDATE_PAUSE_INTERVAL,
} from '~/constants/notifications'
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
      updateOn: false,
      updatePause: false,
      menuDelayTicks: 0,
      menuTimerId: null,
      hover: false,
    }
  },
  props: {
    placement: { type: String },
  },
  methods: {
    updateNotifications() {
      if (this.updateOn || this.updatePause) return

      this.updateOn = true
      this.$apollo.queries.notifications.refetch()
    },
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
    hoverUpdate() {
      if (this.hover) return

      // update is triggered kind of one second before the user clicks
      this.hover = true
      this.updateNotifications()
    },
    callToggleMenu(toggleMenu) {
      if (this.menuTimerId) return

      this.updateNotifications() // then the update works even on mobile by click and without hover
      // open menu after update is done, but latest after delay of "NOTIFICATIONS_MENU_OPEN_LATEST_INTERVAL"
      this.menuDelayTicks = 0
      this.menuTimerId = setInterval(() => {
        if (!this.updateOn || NOTIFICATIONS_MENU_OPEN_LATEST_INTERVAL <= this.menuDelayTicks) {
          toggleMenu()
          clearInterval(this.menuTimerId)
          this.menuTimerId = null
        } else this.menuDelayTicks += NOTIFICATIONS_CHECK_UPDATED_INTERVAL
      }, NOTIFICATIONS_CHECK_UPDATED_INTERVAL)
    },
    equalNotification(a, b) {
      return a.from.id === b.from.id && a.createdAt === b.createdAt && a.reason === b.reason
    },
  },
  computed: {
    totalNotificationsCount() {
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
  },
  apollo: {
    notifications: {
      query() {
        return notificationQuery(this.$i18n)
      },
      pollInterval() {
        return NOTIFICATIONS_POLL_INTERVAL
      },
      update(data) {
        const newNotifications = data.notifications.filter(newN => {
          return !this.displayedNotifications.find(oldN => this.equalNotification(newN, oldN))
        })
        this.displayedNotifications = newNotifications
          .concat(this.displayedNotifications)
          .sort((a, b) => {
            return a.createdAt === b.createdAt
              ? 0
              : new Date(a.createdAt) < new Date(b.createdAt)
              ? 1
              : -1
          })
        this.updateOn = false

        // pause before next triggered update by "updateNotifications"
        this.updatePause = true
        setTimeout(() => {
          this.updatePause = false
        }, NOTIFICATIONS_UPDATE_PAUSE_INTERVAL)

        return data.notifications
      },
      error(error) {
        this.$toast.error(error)
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

.notifications-menu-pointer {
  cursor: pointer;
}

.notifications-menu-popover {
  max-width: 500px;
}
</style>
