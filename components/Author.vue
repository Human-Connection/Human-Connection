<template>
  <dropdown
    :disabled="!hasAuthor || !showAuthorPopover"
    placement="top-start"
    offset="0"
  >
    <template
      slot="default"
      slot-scope="{openMenu, closeMenu, isOpen}"
    >
      <a
        v-router-link
        :href="author.slug ? $router.resolve({ name: 'profile-slug', params: { slug: author.slug } }).href : null"
        :class="['author', isOpen && 'active']"
        @mouseover="openMenu(true)"
        @mouseleave="closeMenu(true)"
      >
        <div style="display: inline-block; float: left; margin-right: 4px;  height: 100%; vertical-align: middle;">
          <ds-avatar
            :image="author.avatar"
            :name="author.name"
            style="display: inline-block; vertical-align: middle;"
            size="32px"
          />
        </div>
        <div style="display: inline-block; height: 100%; vertical-align: middle;">
          <b
            class="username"
            style="vertical-align: middle;"
          >
            {{ author.name | truncate(trunc, 18) }}
          </b>
          <template v-if="post.createdAt">
            <br>
            <ds-text
              size="small"
              color="soft"
            >
              {{ post.createdAt | dateTime('dd. MMMM yyyy HH:mm') }}
            </ds-text>
          </template>
        </div>
      </a>
    </template>
    <template
      slot="popover"
    >
      <div style="min-width: 250px">
        <!--<ds-avatar
          :image="author.avatar"
          :name="author.name || 'Anonymus'"
          class="profile-avatar"
          size="90px" />-->
        <hc-badges
          v-if="author.badges && author.badges.length"
          :badges="author.badges"
        />
        <ds-text
          v-if="author.location"
          align="center"
          color="soft"
          size="small"
          style="margin-top: 5px"
          bold
        >
          <ds-icon name="map-marker" /> {{ author.location.name }}
        </ds-text>
        <ds-flex
          style="margin-top: -10px"
        >
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
                :count="author.contributionsCount"
                :label="$t('common.post', null, author.contributionsCount)"
              />
            </ds-space>
          </ds-flex-item>
          <ds-flex-item class="ds-tab-nav-item">
            <ds-space margin="small">
              <ds-number
                :count="author.commentsCount"
                :label="$t('common.comment', null, author.commentsCount)"
              />
            </ds-space>
          </ds-flex-item>
        </ds-flex>
        <!--<ds-text
          color="soft"
          size="small">
          <ds-icon name="map-marker" /> Hamburg, Deutschland
        </ds-text>-->
        <ds-flex
          v-if="!itsMe"
          gutter="x-small"
          style="margin-bottom: 0;"
        >
          <ds-flex-item :width="{base: 3}">
            <hc-follow-button
              :follow-id="author.id"
              :is-followed="author.followedByCurrentUser"
              @update="following => author.followedByCurrentUser = following"
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
import HcFollowButton from '~/components/FollowButton.vue'
import HcBadges from '~/components/Badges.vue'
import Dropdown from '~/components/Dropdown'

export default {
  name: 'HcAuthor',
  components: {
    HcFollowButton,
    HcBadges,
    Dropdown
  },
  props: {
    post: { type: Object, default: null },
    trunc: { type: Number, default: null },
    showAuthorPopover: { type: Boolean, default: true }
  },
  data() {
    return {
      voted: false
    }
  },
  computed: {
    itsMe() {
      return this.author.slug === this.$store.getters['auth/user'].slug
    },
    fanCount() {
      let count = Number(this.author.followedByCount) || 0
      if (this.voted) {
        // NOTE: this is used for presentation
        count += 1
      }
      return count
    },
    author() {
      return this.hasAuthor
        ? this.post.author
        : {
            name: 'Anonymus'
          }
    },
    hasAuthor() {
      return Boolean(this.post && this.post.author)
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
.author {
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
