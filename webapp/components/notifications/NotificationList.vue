<template>
  <div>
    <notification
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @read="markAsRead(notification.id)"
    />
  </div>
</template>

<script>
import Notification from './Notification'
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
  name: 'NotificationList',
  components: {
    Notification
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
