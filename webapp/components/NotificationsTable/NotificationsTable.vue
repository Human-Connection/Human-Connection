<template>
  <ds-table
    v-if="notificationsData && notificationsData.length"
    :data="notificationsData"
    :fields="fields"
  >
    <template #icon="scope">
      <base-icon
        :name="scope.row.iconName"
        v-tooltip="{ content: $t(scope.row.iconTooltip), placement: 'right' }"
        :class="{ 'notification-status': scope.row.read }"
      />
    </template>
    <template #triggerer="scope">
      <ds-text :class="{ 'notification-status': scope.row.read, reason: true }">
        {{ $t(`notifications.reason.${scope.row.reason}` + scope.row.reasonTranslationExtention) }}
      </ds-text>
      <client-only>
        <user-teaser
          :user="scope.row.triggerer"
          :date-time="scope.row.createdAt"
          :class="{ 'notification-status': scope.row.read }"
        />
      </client-only>
    </template>
    <template #title="scope">
      <nuxt-link
        data-test="notification-title-link"
        :class="{ 'notification-status': scope.row.read }"
        :to="scope.row.linkTo"
        @click.native="markNotificationAsRead(scope.row.notificationSourceId)"
      >
        <b>{{ scope.row.title | truncate(50) }}</b>
      </nuxt-link>
    </template>
    <template #metadata="scope">
      <div v-if="scope.row.isUser" :class="{ 'notification-status': scope.row.read }">
        <user-teaser :user="scope.row.user" />
      </div>
      <div v-else-if="scope.row.contentExcerpt" :class="{ 'notification-status': scope.row.read }">
        <span v-if="scope.row.isComment" class="notification-content-header-text">
          {{ $t(`notifications.comment`) }}:
        </span>
        {{ scope.row.contentExcerpt | removeHtml }}
      </div>
      <div v-if="scope.row.isReport" :class="{ 'notification-status': scope.row.read }">
        <ds-space margin-bottom="x-small" />
        <span class="notification-content-header-text">
          {{ $t(`notifications.filedReport.category`) }}:
        </span>
        {{ $t('report.reason.category.options.' + scope.row.filedReport.reasonCategory) }}
        <br />
        <span class="notification-content-header-text">
          {{ $t(`notifications.filedReport.description`) }}:
        </span>
        <span
          v-if="
            scope.row.filedReport.reasonDescription &&
            scope.row.filedReport.reasonDescription !== ''
          "
        >
          {{ scope.row.filedReport.reasonDescription }}
        </span>
        <span v-else>
          —
        </span>
      </div>
    </template>
  </ds-table>
  <hc-empty v-else icon="alert" :message="$t('notifications.empty')" />
</template>
<script>
import { mapGetters } from 'vuex'
import { extractNotificationDataOfCurrentUser } from '~/components/utils/Notifications'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import HcEmpty from '~/components/Empty/Empty'

export default {
  components: {
    UserTeaser,
    HcEmpty,
  },
  props: {
    notifications: { type: Array, default: () => [] },
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    fields() {
      return {
        icon: {
          label: ' ',
          width: '3%',
        },
        triggerer: {
          label: ' ',
          width: '25%',
        },
        title: {
          label: ' ',
          width: '25%',
        },
        metadata: {
          label: ' ',
          width: '47%',
        },
      }
    },
    notificationsData() {
      return this.notifications.map((notification) =>
        extractNotificationDataOfCurrentUser(notification, this.currentUser),
      )
    },
  },
  methods: {
    markNotificationAsRead(notificationSourceId) {
      this.$emit('markNotificationAsRead', notificationSourceId)
    },
  },
}
</script>
<style lang="scss">
.notification-status {
  opacity: $opacity-soft;
}
.notification-content-header-text {
  font-weight: 700;
  margin-right: 0.1rem;
}
</style>
