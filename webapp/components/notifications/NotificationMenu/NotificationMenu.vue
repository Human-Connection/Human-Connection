<template>
  <div
    v-if="totalNotifications <= 0"
    class="notifications-menu-pointer"
    @click.prevent="updateNotifications"
  >
    <ds-button class="notifications-menu" disabled icon="bell">
      {{ unreadNotifications }}
    </ds-button>
  </div>
  <dropdown v-else class="notifications-menu" :placement="placement">
    <template slot="default" slot-scope="{ toggleMenu }">
      <ds-button
        primary
        icon="bell"
        @click.prevent="
          () => {
            toggleMenu()
            updateNotifications()
          }
        "
      >
        {{ unreadNotifications }}
      </ds-button>
    </template>
    <template slot="popover">
      <div class="notifications-menu-popover">
        <notification-list :notifications="notifications" @markAsRead="markAsRead" />
      </div>
    </template>
  </dropdown>
</template>

<script>
import Dropdown from '~/components/Dropdown'
import { REFRESH_MILLISEC } from '~/constants/notifications'
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
      notifications: [],
    }
  },
  props: {
    placement: { type: String },
  },
  created() {
    setInterval(this.updateNotifications, REFRESH_MILLISEC)
  },
  destroyed() {
    clearInterval(this.updateNotifications)
  },
  methods: {
    async updateNotifications() {
      try {
        const {
          data: { notifications },
        } = await this.$apollo.mutate({
          mutation: notificationQuery(this.$i18n),
        })
        // add all the new notifications to the notifications
        if (notifications) {
          notifications.forEach(udatedListNotification => {
            const sameNotification = this.notifications.find(function(oldListNotification) {
              return (
                oldListNotification.from.id === udatedListNotification.from.id &&
                oldListNotification.createdAt === udatedListNotification.createdAt &&
                oldListNotification.reason === udatedListNotification.reason
              )
            })
            if (sameNotification === undefined) {
              this.notifications.unshift(udatedListNotification)
            }
          })
        }
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
        this.notifications = this.notifications.map(n => {
          return n.from.id === markAsRead.from.id ? markAsRead : n
        })
      } catch (err) {
        throw new Error(err)
      }
    },
  },
  computed: {
    totalNotifications() {
      return (this.notifications || []).length
    },
    unreadNotifications() {
      let countUnread = 0
      if (this.notifications) {
        this.notifications.forEach(notification => {
          if (!notification.read) countUnread++
        })
      }
      return countUnread
    },
    clickMenuButton() {
      toggleMenu()
    },
  },
  apollo: {
    notifications: {
      query() {
        return notificationQuery(this.$i18n)
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
