<template>
  <div class="notifications-menu-pointer" @mouseover="hoverActive" @mouseleave="hover = false">
    <!-- Wolle <div
      v-if="totalNotificationsCount === 0"
      class="notifications-menu-pointer"
      @click.prevent="updateNotifications"
    > -->
    <div v-if="totalNotificationsCount === 0" class="notifications-menu-pointer" @click.prevent="">
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
  NOTIFICATIONS_UPDATE_CHECK_INTERVAL,
  NOTIFICATIONS_MENU_OPEN_LATEST_INTERVAL,
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
      updateTicks: 0,
      updateMenuReference: null,
      hover: false,
    }
  },
  props: {
    placement: { type: String },
  },
  methods: {
    updateNotifications() {
      if (this.updateOn) return

      console.log('hover updateNotifications')
      this.updateOn = true
      try {
        this.$apollo.queries.notifications.refetch()
      } catch (err) {
        throw new Error(err)
      }
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
        throw new Error(err)
      }
    },
    hoverActive() {
      if (this.hover) return

      this.hover = true
      this.updateNotifications()
    },
    callToggleMenu(toggleMenu) {
      // Wolle this.updateNotifications()
      if (this.updateMenuReference) return

      this.updateTicks = 0
      this.updateMenuReference = setInterval(() => {
        console.log('check for update: ', this.updateOn, this.updateTicks)

        if (!this.updateOn || NOTIFICATIONS_MENU_OPEN_LATEST_INTERVAL <= this.updateTicks) {
          console.log('toggleMenu')
          toggleMenu()
          clearInterval(this.updateMenuReference)
          this.updateMenuReference = null
        } else this.updateTicks += NOTIFICATIONS_UPDATE_CHECK_INTERVAL
      }, NOTIFICATIONS_UPDATE_CHECK_INTERVAL)
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
        this.displayedNotifications = newNotifications.concat(this.displayedNotifications)
        this.updateOn = false
        return data.notifications
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
