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
import Notification from '../Notification'

export default {
  name: 'NotificationList',
  components: {
    Notification,
  },
  props: {
    notifications: {
      type: Array,
      required: true,
    },
  },
  methods: {
    markAsRead(notificationId) {
      this.$emit('markAsRead', notificationId)
    },
  },
}
</script>
