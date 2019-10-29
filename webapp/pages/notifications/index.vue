<template>
  <ds-card space="small">
    <ds-flex>
      <ds-flex-item :width="{ lg: '85%' }">
        <ds-heading tag="h3">{{ $t('notifications.title') }}</ds-heading>
      </ds-flex-item>
      <ds-flex-item class="sorting-dropdown">
        <client-only>
          <notifications-dropdown-filter @sortNotifications="sortNotifications" />
        </client-only>
      </ds-flex-item>
    </ds-flex>
    <ds-space />
    <notifications-table
      @markNotificationAsRead="markNotificationAsRead"
      :notifications="notifications"
    />
    <paginate :hasNext="hasNext" :hasPrevious="hasPrevious" @back="back" @next="next" />
  </ds-card>
</template>

<script>
import NotificationsTable from '~/components/NotificationsTable/NotificationsTable'
import NotificationsDropdownFilter from '~/components/NotificationsDropdownFilter/NotificationsDropdownFilter'
import Paginate from '~/components/Paginate/Paginate'
import { notificationQuery, markAsReadMutation } from '~/graphql/User'

export default {
  components: {
    NotificationsDropdownFilter,
    NotificationsTable,
    Paginate,
  },
  data() {
    const pageSize = 12
    return {
      offset: 0,
      notifications: [],
      nofiticationRead: null,
      pageSize,
      first: pageSize,
      hasNext: false,
    }
  },
  computed: {
    hasPrevious() {
      return this.offset > 0
    },
  },
  methods: {
    sortNotifications(option) {
      this.notificationRead = option.value
      this.$apollo.queries.notifications.refresh()
    },
    async markNotificationAsRead(notificationSourceId) {
      try {
        await this.$apollo.mutate({
          mutation: markAsReadMutation(this.$i18n),
          variables: { id: notificationSourceId },
        })
      } catch (error) {
        this.$toast.error(error.message)
      }
    },
    back() {
      this.offset = Math.max(this.offset - this.pageSize, 0)
    },
    next() {
      this.offset += this.pageSize
    },
  },
  apollo: {
    notifications: {
      query() {
        return notificationQuery(this.$i18n)
      },
      variables() {
        const { first, offset } = this
        return {
          read: this.notificationRead,
          orderBy: 'updatedAt_desc',
          first,
          offset,
        }
      },
      update({ notifications }) {
        if (!notifications) return []
        this.hasNext = notifications.length >= this.pageSize
        if (notifications.length <= 0 && this.offset > 0) return this.notifications // edge case, avoid a blank page
        return notifications.map((notification, index) =>
          Object.assign({}, notification, { index: this.offset + index }),
        )
      },
      fetchPolicy: 'cache-and-network',
      error(error) {
        this.$toast.error(error.message)
      },
    },
  },
}
</script>
<style lang="scss">
.sorting-dropdown {
  float: right;
}
</style>
