<template>
  <!-- Wolle <ds-space :class="{ read: notification.read, notification: true }" margin-bottom="x-small">
    <client-only>
      <ds-space margin-bottom="x-small">
        <user-teaser :user="notificationData.triggerer" :date-time="notificationData.createdAt" />
      </ds-space>
      <ds-text data-test="reason-text" color="soft">
        <base-icon
          :name="notificationData.iconName"
          v-tooltip="{ content: $t(notificationData.iconTooltip), placement: 'right' }"
        />
        {{
          $t(
            `notifications.reason.${notificationData.reason}` +
              notificationData.reasonTranslationExtention,
          )
        }}
      </ds-text>
    </client-only>
    <ds-space margin-bottom="x-small" />
    <nuxt-link :to="notificationData.linkTo" @click.native="$emit('read')"> -->
  <!-- <ds-space margin-bottom="x-small">
        <ds-card
          :header="
            (notificationData.isPost || notificationData.isComment) && notificationData.title
          "
          hover
          space="x-small"
          class="notifications-card"
        >
          <! because of different margin above ds-card content without header property >
          <user-teaser
            v-if="notificationData.isUser"
            class="notifications-user-teaser"
            :user="notificationData.user"
          />
          <div v-else>
            <span v-if="notificationData.isComment" class="notification-content-header-text">
              {{ $t(`notifications.comment`) }}:
            </span>
            {{ notificationData.contentExcerpt | removeHtml }}
          </div>
          <div v-if="notificationData.isReport">
            <ds-space margin-bottom="x-small" />
            <span class="notification-content-header-text">
              {{ $t(`notifications.report.category`) }}:
            </span>
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
          <! because of different margin underneath ds-card content without header property >
          <ds-space
            v-if="!(notificationData.isPost || notificationData.isComment)"
            margin-bottom="base"
          />
        </ds-card>
      </ds-space> -->
  <article :class="{ '--read': notificationData.read, notification: true }">
    <client-only>
      <user-teaser :user="notificationData.triggerer" :date-time="notificationData.createdAt" />
    </client-only>
    <p class="description">
      <base-icon
        :name="notificationData.iconName"
        v-tooltip="{ content: $t(notificationData.iconTooltip), placement: 'right' }"
      />
      {{
        $t(
          `notifications.reason.${notificationData.reason}` +
            notificationData.reasonTranslationExtention,
        )
      }}
    </p>
    <nuxt-link class="link" :to="notificationData.linkTo" @click.native="$emit('read')">
      <base-card wideContent>
        <h2 class="title">
          {{ (notificationData.isPost || notificationData.isComment) && notificationData.title }}
        </h2>
        <p>
          <strong v-if="notificationData.isComment" class="comment">
            {{ $t(`notifications.comment`) }}:
          </strong>
          {{ notificationData.contentExcerpt | removeHtml }}
        </p>
        <!-- because of different margin above ds-card content without header property -->
        <user-teaser
          v-if="notificationData.isUser"
          class="notifications-user-teaser"
          :user="notificationData.user"
        />
        <p v-else>
          <strong v-if="notificationData.isComment" class="comment">
            {{ $t(`notifications.comment`) }}:
          </strong>
          {{ notificationData.contentExcerpt | removeHtml }}
        </p>
        <div v-if="notificationData.isReport">
          <ds-space margin-bottom="x-small" />
          <strong>{{ $t(`notifications.report.category`) }}:</strong>
          {{ $t('report.reason.category.options.' + notificationData.report.reasonCategory) }}
          <br />
          <strong>{{ $t(`notifications.report.description`) }}:</strong>
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
        <!-- because of different margin underneath ds-card content without header property -->
        <ds-space
          v-if="!(notificationData.isPost || notificationData.isComment)"
          margin-bottom="base"
        />
      </base-card>
    </nuxt-link>
  </article>
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
// Wolle .notification.read {
//   opacity: $opacity-soft;
// }
// .notifications-card {
//   min-width: 500px;
// }
// .notification-content-header-text {
//   font-weight: 700;
//   margin-right: 0.1rem;

.notification {
  margin-bottom: $space-base;

  &:first-of-type {
    margin-top: $space-x-small;
  }

  &.--read {
    opacity: $opacity-disabled;
  }

  > .description {
    margin-bottom: $space-x-small;
  }

  > .link {
    display: block;
    color: $text-color-base;

    &:hover {
      color: $color-primary;
    }
  }

  .user-teaser {
    margin-bottom: $space-x-small;
  }

  .comment {
    font-weight: $font-weight-bold;
  }
}
// Wolle .notifications-card {
//   > .user-teaser {
//     margin-top: $space-small;
//   }
// }
.notifications-user-teaser {
  margin-top: $space-small;
}
</style>
