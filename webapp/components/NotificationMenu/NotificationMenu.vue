<template>
  <base-button v-if="!notifications.length" class="notifications-menu" disabled ghost circle>
    <counter-icon icon="bell" :count="unreadNotificationsCount" danger />
  </base-button>
  <dropdown v-else class="notifications-menu" offset="8" :placement="placement">
    <template slot="default" slot-scope="{ toggleMenu }">
      <base-button @click="toggleMenu" ghost circle>
        <counter-icon icon="bell" :count="unreadNotificationsCount" danger />
      </base-button>
    </template>
    <template slot="popover">
      <div class="notifications-menu-popover">
        <notification-list :notifications="notifications" @markAsRead="markAsRead" />
      </div>
      <div class="notifications-link-container">
        <nuxt-link :to="{ name: 'notifications' }">
          {{ $t('notifications.pageLink') }}
        </nuxt-link>
      </div>
    </template>
  </dropdown>
</template>

<script>
import { mapGetters } from 'vuex'
import unionBy from 'lodash/unionBy'
import { notificationQuery, markAsReadMutation, notificationAdded } from '~/graphql/User'
import CounterIcon from '~/components/_new/generic/CounterIcon/CounterIcon'
import Dropdown from '~/components/Dropdown'
import NotificationList from '../NotificationList/NotificationList'

export default {
  name: 'NotificationMenu',
  components: {
    CounterIcon,
    Dropdown,
    NotificationList,
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
        await this.$apollo.mutate({
          mutation: markAsReadMutation(this.$i18n),
          variables,
        })
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
    unreadNotificationsCount() {
      const result = this.notifications.reduce((count, notification) => {
        return notification.read ? count : count + 1
      }, 0)
      return result
    },
  },
  apollo: {
    notifications: {
      query() {
        return notificationQuery(this.$i18n)
      },
      variables() {
        return {
          read: false,
          orderBy: 'updatedAt_desc',
        }
      },
      subscribeToMore: {
        document: notificationAdded(),
        variables() {
          return {
            userId: this.user.id,
          }
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const {
            data: { notificationAdded: newNotification },
          } = subscriptionData
          return {
            notifications: unionBy(
              [newNotification],
              previousResult.notifications,
              notification => notification.id,
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
          }
        },
      },
      error(error) {
        this.$toast.error(error.message)
      },
    },
  },
}
</script>

<style lang="scss">
.notifications-menu {
  flex-shrink: 0;
  display: flex;
  align-items: center;

  .base-button {
    overflow: visible;
  }
}

.notifications-menu-popover {
  max-width: 500px;
  margin-bottom: $size-height-base;
}
.notifications-link-container {
  background-color: $background-color-softer-active;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: $size-height-base;
  padding: $space-x-small;
}
</style>
