<template>
  <div class="user-teaser" v-if="displayAnonymous">
    <user-avatar v-if="showAvatar" size="small" />
    <span class="info anonymous">{{ $t('profile.userAnonym') }}</span>
  </div>
  <div v-else :class="[{ 'disabled-content': user.disabled }]" placement="top-start">
    <nuxt-link :to="userLink" :class="['user-teaser']">
      <user-avatar v-if="showAvatar" :user="user" size="small" />
      <div class="info">
        <span class="text">
          <span class="slug">{{ userSlug }}</span>
          <span v-if="dateTime">{{ userName }}</span>
        </span>
        <span v-if="dateTime" class="text">
          <base-icon name="clock" />
          <hc-relative-date-time :date-time="dateTime" />
          <slot name="dateTime"></slot>
        </span>
        <span v-else class="text">{{ userName }}</span>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import HcRelativeDateTime from '~/components/RelativeDateTime'
import UserAvatar from '~/components/_new/generic/UserAvatar/UserAvatar'

export default {
  name: 'UserTeaser',
  components: {
    HcRelativeDateTime,
    UserAvatar,
  },
  props: {
    user: { type: Object, default: null },
    showAvatar: { type: Boolean, default: true },
    dateTime: { type: [Date, String], default: null },
    showPopover: { type: Boolean, default: true },
  },
  computed: {
    ...mapGetters({
      isModerator: 'auth/isModerator',
    }),
    itsMe() {
      return this.user.slug === this.$store.getters['auth/user'].slug
    },
    displayAnonymous() {
      const { user, isModerator } = this
      return !user || user.deleted || (user.disabled && !isModerator)
    },
    userLink() {
      const { id, slug } = this.user
      if (!(id && slug)) return ''
      return { name: 'profile-id-slug', params: { slug, id } }
    },
    userSlug() {
      const { slug } = this.user || {}
      return slug && `@${slug}`
    },
    userName() {
      const { name } = this.user || {}
      return name || this.$t('profile.userAnonym')
    },
  },
  methods: {
    optimisticFollow({ followedByCurrentUser }) {
      const inc = followedByCurrentUser ? 1 : -1
      this.user.followedByCurrentUser = followedByCurrentUser
      this.user.followedByCount += inc
    },
    updateFollow({ followedByCurrentUser, followedByCount }) {
      this.user.followedByCount = followedByCount
      this.user.followedByCurrentUser = followedByCurrentUser
    },
  },
}
</script>

<style lang="scss">
.trigger {
  max-width: 100%;
}

.user-teaser {
  display: flex;
  flex-wrap: nowrap;

  > .user-avatar {
    flex-shrink: 0;
  }

  > .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: $space-xx-small;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: $text-color-soft;
    font-size: $font-size-small;

    &.anonymous {
      font-size: $font-size-base;
    }

    .slug {
      color: $color-primary;
      font-size: $font-size-base;
    }
  }

  .text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    > .ds-text {
      display: inline;
    }
  }
}
</style>
