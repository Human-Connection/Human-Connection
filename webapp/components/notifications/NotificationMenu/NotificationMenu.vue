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

.notifications-menu-popover {
  max-width: 500px;
}
</style>
