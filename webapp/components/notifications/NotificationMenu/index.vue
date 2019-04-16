<template>
  <ds-button
    v-if="totalNotifications <= 0"
    disabled
    icon="bell"
  >
    {{ totalNotifications }}
  </ds-button>
  <dropdown
    v-else
    class="notifications-menu"
  >
    <template
      slot="default"
      slot-scope="{toggleMenu}"
    >
      <ds-button
        primary
        icon="bell"
        @click.prevent="toggleMenu"
      >
        {{ totalNotifications }}
      </ds-button>
    </template>
    <template
      slot="popover"
    >
      <div class="notifications-menu-popover">
        <notification-list
          :notifications="notifications"
          @markAsRead="markAsRead"
        />
      </div>
    </template>
  </dropdown>
</template>

<script>
import NotificationList from '../NotificationList'
import Dropdown from '~/components/Dropdown'
import gql from 'graphql-tag'

const MARK_AS_READ = gql(`
mutation($id: ID!, $read: Boolean!) {
  UpdateNotification(id: $id, read: $read) {
    id
    read
  }
}`)

const NOTIFICATIONS = gql(`{
  currentUser {
    id
    notifications(read: false, orderBy: createdAt_desc) {
      id read createdAt
      post {
        title contentExcerpt slug
        author { id slug name disabled deleted }
      }
    }
  }
}`)

export default {
  name: 'NotificationMenu',
  components: {
    NotificationList,
    Dropdown
  },
  computed: {
    totalNotifications() {
      return (this.notifications || []).length
    }
  },
  methods: {
    async markAsRead(notificationId) {
      const variables = { id: notificationId, read: true }
      try {
        await this.$apollo.mutate({
          mutation: MARK_AS_READ,
          variables
        })
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  apollo: {
    notifications: {
      query: NOTIFICATIONS,
      update: data => {
        const {
          currentUser: { notifications }
        } = data
        return notifications
      }
    }
  }
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
