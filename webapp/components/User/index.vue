<template>
  <div v-if="!user || ((user.disabled || user.deleted) && !isModerator)">
    <div
      style="display: inline-block; float: left; margin-right: 4px;  height: 100%; vertical-align: middle;"
    >
      <ds-avatar
        style="display: inline-block; vertical-align: middle;"
        size="32px"
      />
    </div>
    <div style="display: inline-block; height: 100%; vertical-align: middle;">
      <b
        class="username"
        style="vertical-align: middle;"
      >{{ $t('profile.userAnonym') }}</b>
    </div>
  </div>
  <dropdown
    v-else
    :class="{'disabled-content': user.disabled}"
    placement="top-start"
    offset="0"
  >
    <template
      slot="default"
      slot-scope="{openMenu, closeMenu, isOpen}"
    >
      <nuxt-link
        :to="userLink"
        :class="['user', isOpen && 'active']"
      >
        <div
          @mouseover="openMenu(true)"
          @mouseleave="closeMenu(true)"
        >
          <div
            style="display: inline-block; float: left; margin-right: 4px;  height: 100%; vertical-align: middle;"
          >
            <ds-avatar
              :image="user.avatar"
              :name="userName(user.name)"
              style="display: inline-block; vertical-align: middle;"
              size="32px"
            />
          </div>
          <div style="display: inline-block; height: 100%; vertical-align: middle;">
            <b
              class="username"
              style="vertical-align: middle;"
            >{{ userName(user.name,18) }}</b>
          </div>
          <!-- Time -->
          <div
            v-if="dateTime"
            style="display: inline;"
          >
            <ds-text
              align="right"
              size="small"
              color="soft"
            >
              <ds-icon name="clock" />
              <no-ssr>
                <hc-relative-date-time :date-time="dateTime" />
              </no-ssr>
            </ds-text>
          </div>
        </div>
      </nuxt-link>
    </template>
    <template slot="popover">
      <div style="min-width: 250px">
        <hc-badges
          v-if="user.badges && user.badges.length"
          :badges="user.badges"
        />
        <ds-text
          v-if="user.location"
          align="center"
          color="soft"
          size="small"
          style="margin-top: 5px"
          bold
        >
          <ds-icon name="map-marker" />
          {{ user.location.name }}
        </ds-text>
        <ds-flex style="margin-top: -10px">
          <ds-flex-item class="ds-tab-nav-item">
            <ds-space margin="small">
              <ds-number
                :count="fanCount"
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
                :count="user.commentsCount"
                :label="$t('common.comment', null, user.commentsCount)"
              />
            </ds-space>
          </ds-flex-item>
        </ds-flex>
        <ds-flex
          v-if="!itsMe"
          gutter="x-small"
          style="margin-bottom: 0;"
        >
          <ds-flex-item :width="{base: 3}">
            <hc-follow-button
              :follow-id="user.id"
              :is-followed="user.followedByCurrentUser"
              @optimistic="follow => user.followedByCurrentUser = follow"
              @update="follow => user.followedByCurrentUser = follow"
            />
          </ds-flex-item>
          <ds-flex-item :width="{base: 1}">
            <ds-button fullwidth>
              <ds-icon name="user-times" />
            </ds-button>
          </ds-flex-item>
        </ds-flex>
        <!--<ds-space margin-bottom="x-small" />-->
      </div>
    </template>
  </dropdown>
</template>

<script>
import { mapGetters } from 'vuex'

import HcRelativeDateTime from '~/components/RelativeDateTime'
import HcFollowButton from '~/components/FollowButton'
import HcBadges from '~/components/Badges'
import Dropdown from '~/components/Dropdown'
import userName from '~/components/_mixins/userName'

export default {
  name: 'HcUser',
  components: {
    HcRelativeDateTime,
    HcFollowButton,
    HcBadges,
    Dropdown
  },
  mixins: [userName],
  props: {
    user: { type: Object, default: null },
    trunc: { type: Number, default: null },
    dateTime: { type: [Date, String], default: null }
  },
  computed: {
    ...mapGetters({
      isModerator: 'auth/isModerator'
    }),
    itsMe() {
      return this.user.slug === this.$store.getters['auth/user'].slug
    },
    fanCount() {
      let count = Number(this.user.followedByCount) || 0
      return count
    },
    userLink() {
      const { id, slug } = this.user
      if (!(id && slug)) return ''
      return { name: 'profile-id-slug', params: { slug, id } }
    }
  }
}
</script>

<style lang="scss">
.profile-avatar {
  display: block;
  margin: auto;
  margin-top: -45px;
  border: #fff 5px solid;
}
.user {
  white-space: nowrap;
  position: relative;
  display: flex;
  align-items: center;

  &:hover,
  &.active {
    z-index: 999;
  }
}
</style>
