<template>
  <div>
    <notification
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @read="markAsRead(notification.from.id)"
    />
  </div>
</template>

<script>
import Notification from '../Notification/Notification'

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
    async markAsRead(notificationSourceId) {
      this.$emit('markAsRead', notificationSourceId)
    },
  },
}
</script>
