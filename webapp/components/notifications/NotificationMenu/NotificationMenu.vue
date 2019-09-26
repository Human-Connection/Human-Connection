<template>
  <div
    v-if="totalNotifications <= 0"
    class="notifications-menu-pointer"
    @click.prevent="updateNotifications"
  >
    <ds-button class="notifications-menu" disabled icon="bell">{{ unreadNotifications }}</ds-button>
  </div>
  <dropdown v-else class="notifications-menu" :placement="placement">
    <template slot="default" slot-scope="{ toggleMenu }">
      <ds-button
        primary
        icon="bell"
        @click.prevent="
          toggleMenu()
          updateNotifications()
        "
      >
        {{ unreadNotifications }}
      </ds-button>
    </template>
    <template slot="popover">
      <div class="notifications-menu-popover">
        <notification-list :notifications="displayedNotifications" @markAsRead="markAsRead" />
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
      displayedNotifications: [],
      notifications: [],
    }
  },
  props: {
    placement: { type: String },
  },
  watch: {
    notifications: {
      immediate: true,
      handler(lastQueriedNotifications) {
        if (lastQueriedNotifications && lastQueriedNotifications.length > 0) {
          lastQueriedNotifications.forEach(updatedListNotification => {
            const sameNotification = this.displayedNotifications.find(oldListNotification => {
              return this.equalNotification(oldListNotification, updatedListNotification)
            })
            if (!sameNotification) this.displayedNotifications.unshift(updatedListNotification)
          })
        }
      },
    },
  },

  methods: {
    async updateNotifications() {
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
    equalNotification(a, b) {
      return a.from.id === b.from.id && a.createdAt === b.createdAt && a.reason === b.reason
    },
  },
  computed: {
    totalNotifications() {
      return (this.displayedNotifications || []).length
    },
    unreadNotifications() {
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
