<template>
  <ds-space :class="{ read: notificationData.read, notification: true }" margin-bottom="x-small">
    <client-only>
      <ds-space margin-bottom="x-small">
        <user-teaser
          :user="notificationData.triggerer"
          :date-time="notificationData.createdAt"
        />
      </ds-space>
      <ds-text class="reason-text-for-test" color="soft">
        {{
          $t(`notifications.reason.${notificationData.reason}` + notificationData.reasonExtention)
        }}
      </ds-text>
    </client-only>
    <ds-space margin-bottom="x-small" />
    <nuxt-link
      class="notification-link-for-test"
      :to="notificationData.linkTo"
      @click.native="$emit('read')"
    >
      <ds-space margin-bottom="x-small">
        <ds-card :header="notificationData.title" hover space="x-small" class="notifications-card">
          <ds-space margin-bottom="x-small" />
          <div v-if="notificationData.user">
            <user-teaser :user="notificationData.user" />
          </div>
          <div v-else-if="notificationData.contentExcerpt">
            <span v-if="notificationData.comment" class="notification-content-header-text">
              {{ $t(`notifications.comment`) }}:
            </span>
            {{ notificationData.contentExcerpt | removeHtml }}
          </div>
          <div v-if="notificationData.report">
            <ds-space margin-bottom="x-small" />
            <span class="notification-content-header-text">{{ $t(`notifications.report.category`) }}:</span>
            {{ $t('report.reason.category.options.' + notificationData.report.reasonCategory) }}
            <br />
            <span class="notification-content-header-text">
              {{ $t(`notifications.report.description`) }}:
            </span>
            <span
              v-if="
                notificationData.report.reasonDescription &&
                  notificationData.report.reasonDescription !== ''
              "
            >
              {{ notificationData.report.reasonDescription }}
            </span>
            <span v-else>
              —
            </span>
          </div>
        </ds-card>
      </ds-space>
    </nuxt-link>
  </ds-space>
</template>

<script>
import { mapGetters } from 'vuex'
import { extractNotificationDataOfCurrentUser } from '~/components/utils/Notifications'
import UserTeaser from '~/components/UserTeaser/UserTeaser'

export default {
  name: 'Notification',
  components: {
    UserTeaser,
  },
  props: {
    notification: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    notificationData() {
      return extractNotificationDataOfCurrentUser(this.notification, this.currentUser)
    },
  },
}
</script>

<style lang="scss">
.notification.read {
  opacity: $opacity-soft;
}
.notifications-card {
  min-width: 500px;
}
.notification-content-header-text {
  font-weight: 700;
  margin-right: 0.1rem;
}
</style>
