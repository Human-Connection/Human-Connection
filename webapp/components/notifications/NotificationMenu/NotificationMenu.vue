<template>
  <ds-button v-if="totalNotifications <= 0" class="notifications-menu" disabled icon="bell">
    {{ totalNotifications }}
  </ds-button>
  <dropdown v-else class="notifications-menu" :placement="placement">
    <template slot="default" slot-scope="{ toggleMenu }">
      <ds-button primary icon="bell" @click.prevent="toggleMenu">
        {{ totalNotifications }}
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
import { currentUserNotificationsQuery, updateNotificationMutation } from '~/graphql/User'
import NotificationList from '../NotificationList/NotificationList'

export default {
  name: 'NotificationMenu',
  components: {
    NotificationList,
    Dropdown,
  },
  props: {
    placement: { type: String },
  },
  computed: {
    totalNotifications() {
      return (this.notifications || []).length
    },
  },
  methods: {
    async markAsRead(notificationId) {
      const variables = { id: notificationId, read: true }
      try {
        await this.$apollo.mutate({
          mutation: updateNotificationMutation(),
          variables,
        })
      } catch (err) {
        throw new Error(err)
      }
    },
  },
  apollo: {
    notifications: {
      query: currentUserNotificationsQuery(),
      update: data => {
        const {
          currentUser: { notifications },
        } = data
        return notifications
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
