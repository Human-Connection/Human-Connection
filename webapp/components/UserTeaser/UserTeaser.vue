<template>
  <div class="user-teaser" v-if="displayAnonymous">
    <user-avatar v-if="showAvatar" size="small" />
    <span class="info anonymous">{{ $t('profile.userAnonym') }}</span>
  </div>
  <dropdown
    v-else
    :class="[{ 'disabled-content': user.disabled }]"
    placement="top-start"
    offset="0"
  >
    <template #default="{ openMenu, closeMenu, isOpen }">
      <nuxt-link
        :to="userLink"
        :class="['user-teaser', isOpen && 'active']"
        @mouseover.native="showPopover ? openMenu(true) : () => {}"
        @mouseleave.native="closeMenu(true)"
      >
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
    </template>
    <template #popover v-if="showPopover">
      <div style="min-width: 250px">
        <hc-badges v-if="user.badges && user.badges.length" :badges="user.badges" />
        <ds-text
          v-if="user.location"
          align="center"
          color="soft"
          size="small"
          style="margin-top: 5px"
          bold
        >
          <base-icon name="map-marker" />
          {{ user.location.name }}
        </ds-text>
        <ds-flex style="margin-top: -10px">
          <ds-flex-item class="ds-tab-nav-item">
            <ds-space margin="small">
              <ds-number
                :count="user.followedByCount"
                :label="$t('profile.followers')"
                size="x-large"
              />
            </ds-space>
          </ds-flex-item>
          <ds-flex-item class="ds-tab-nav-item ds-tab-nav-item-active">
            <ds-space margin="small">
              <ds-number
                :count="user.contributionsCount"
                :label="$t('common.post', null, user.contributionsCount)"
              />
            </ds-space>
          </ds-flex-item>
          <ds-flex-item class="ds-tab-nav-item">
            <ds-space margin="small">
              <ds-number
                :count="user.commentedCount"
                :label="$t('common.comment', null, user.commentedCount)"
              />
            </ds-space>
          </ds-flex-item>
        </ds-flex>
        <ds-flex v-if="!itsMe" gutter="x-small" style="margin-bottom: 0;">
          <ds-flex-item>
            <hc-follow-button
              :follow-id="user.id"
              :is-followed="user.followedByCurrentUser"
              @optimistic="optimisticFollow"
              @update="updateFollow"
            />
          </ds-flex-item>
        </ds-flex>
      </div>
    </template>
  </dropdown>
</template>

<script>
import { mapGetters } from 'vuex'

import HcRelativeDateTime from '~/components/RelativeDateTime'
import HcFollowButton from '~/components/FollowButton'
import HcBadges from '~/components/Badges'
import UserAvatar from '~/components/_new/generic/UserAvatar/UserAvatar'
import Dropdown from '~/components/Dropdown'

export default {
  name: 'UserTeaser',
  components: {
    HcRelativeDateTime,
    HcFollowButton,
    UserAvatar,
    HcBadges,
    Dropdown,
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
