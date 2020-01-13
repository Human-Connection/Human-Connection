<template>
  <div class="user-teaser" v-if="displayAnonymous">
    <user-avatar v-if="showAvatar" />
    <span class="username">{{ $t('profile.userAnonym') }}</span>
  </div>
  <dropdown v-else :class="{ 'disabled-content': user.disabled }" placement="top-start" offset="0">
    <template #default="{ openMenu, closeMenu, isOpen }">
      <nuxt-link
        :to="userLink"
        :class="['user-teaser', isOpen && 'active']"
        @mouseover.native="showPopover ? openMenu(true) : () => {}"
        @mouseleave.native="closeMenu(true)"
      >
        <user-avatar v-if="showAvatar" :user="user" size="small" />
        <div class="user-info">
          <span class="user-slug">
            {{ userSlug }}
            <span class="username">{{ userName | truncate(18) }}</span>
          </span>
          <ds-text class="date-time" align="left" size="small" color="soft">
            <template v-if="dateTime">
              <base-icon name="clock" />
              <hc-relative-date-time :date-time="dateTime" />
              <slot name="dateTime"></slot>
            </template>
          </ds-text>
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
    trunc: { type: Number, default: 18 }, // "-1" is no trunc
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
.user-teaser {
  display: flex;
  flex-wrap: nowrap;
  z-index: $z-index-hc-post-card-link;
  position: relative;

  > .user-info {
    display: flex;
    flex-direction: column;

    > .ds-text {
      display: flex;
      margin: 0 0 $space-xxx-small $space-xx-small;
    }

    > .user-slug {
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0 0 $space-xxx-small $space-xx-small;
    }
  }
  .username {
    color: $text-color-soft;
    font-size: $font-size-small;
  }
}
</style>
