<template>
  <article :class="{ '--read': notificationData.read, notification: true }">
    <client-only>
      <user-teaser :user="notificationData.triggerer" :date-time="notificationData.createdAt" />
    </client-only>
    <p class="description" data-test="reason-text">
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
        <h2 v-if="notificationData.isPost || notificationData.isComment" class="title">
          {{ notificationData.title }}
        </h2>
        <user-teaser v-if="notificationData.isUser" :user="notificationData.user" />
        <p v-else>
          <strong v-if="notificationData.isComment" class="comment">
            {{ $t(`notifications.comment`) }}:
          </strong>
          {{ notificationData.contentExcerpt | removeHtml }}
        </p>
        <div v-if="notificationData.isReport">
          <ds-space margin-bottom="x-small" />
          <strong>{{ $t(`notifications.filedReport.category`) }}:</strong>
          {{ $t('report.reason.category.options.' + notificationData.filedReport.reasonCategory) }}
          <br />
          <strong>{{ $t(`notifications.filedReport.description`) }}:</strong>
          <span
            v-if="
              notificationData.filedReport.reasonDescription &&
              notificationData.filedReport.reasonDescription !== ''
            "
          >
            {{ notificationData.filedReport.reasonDescription }}
          </span>
          <span v-else>
            —
          </span>
        </div>
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
</style>
