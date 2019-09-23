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
  // created() {
  //   setInterval(this.updateNotifications, REFRESH_MILLISEC)
  // },
  // destroyed() {
  //   clearInterval(this.updateNotifications)
  // },
  watch: {
    notifications: {
      handler(lastQueriedNotifications) {
        console.log('lastQueriedNotifications', lastQueriedNotifications)

        if (this.displayedNotifications && lastQueriedNotifications.length > 0) {
          // set this to be empty to get always called if a query comes with results from the backend
          this.notifications = [] // has the sideeffect the handler is encouraged to be called again, but only once with no effect

          // add all the new notifications to the displayedNotifications at top of the list
          if (lastQueriedNotifications) {
            lastQueriedNotifications.forEach(updatedListNotification => {
              const sameNotification = this.displayedNotifications.find(function(
                oldListNotification,
              ) {
                return (
                  oldListNotification.from.id === updatedListNotification.from.id &&
                  oldListNotification.createdAt === updatedListNotification.createdAt &&
                  oldListNotification.reason === updatedListNotification.reason
                )
              })
              if (sameNotification === undefined) {
                this.displayedNotifications.unshift(updatedListNotification)
              }
            })
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    async updateNotifications() {
      console.log('updateNotifications !!!')
      try {
        const {
          data: { notifications },
        } = await this.$apollo.query({
          query: notificationQuery(this.$i18n),
        })
        console.log('updateNotifications - notifications: ', notifications)
        this.notifications = notifications
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
          return n.from.id === markAsRead.from.id ? markAsRead : n
        })
      } catch (err) {
        throw new Error(err)
      }
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
        return REFRESH_MILLISEC
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
