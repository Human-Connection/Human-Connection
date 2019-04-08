<template>
  <div>
    <notification
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @read="markAsRead(42)"
    />
  </div>
</template>

<script>
import Notification from './Notification'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NotificationList',
  components: {
    Notification
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user'
    }),
    notifications() {
      return this.currentUser.notifications
    }
  },
  methods: {
    ...mapActions({
      markAsRead: 'notifications/markAsRead'
    })
  }
}
</script>
