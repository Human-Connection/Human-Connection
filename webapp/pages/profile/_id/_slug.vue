<template>
  <div>
    <ds-space />
    <ds-flex v-if="user" :width="{ base: '100%' }" gutter="base">
      <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
        <base-card
          :class="{ 'disabled-content': user.disabled }"
          style="position: relative; height: auto; overflow: visible;"
        >
          <hc-upload v-if="myProfile" :user="user">
            <user-avatar :user="user" class="profile-avatar" size="large"></user-avatar>
          </hc-upload>
          <user-avatar v-else :user="user" class="profile-avatar" size="large" />
          <!-- Menu -->
          <client-only>
            <content-menu
              placement="bottom-end"
              resource-type="user"
              :resource="user"
              :is-owner="myProfile"
              class="user-content-menu"
              @mute="muteUser"
              @unmute="unmuteUser"
              @block="blockUser"
              @unblock="unblockUser"
              @delete="deleteUser"
            />
          </client-only>
          <ds-space margin="small">
            <ds-heading tag="h3" align="center" no-margin>
              {{ userName }}
            </ds-heading>
            <ds-text align="center" color="soft">
              {{ userSlug }}
            </ds-text>
            <ds-text v-if="user.location" align="center" color="soft" size="small">
              <base-icon name="map-marker" />
              {{ user.location.name }}
            </ds-text>
            <ds-text align="center" color="soft" size="small">
              {{ $t('profile.memberSince') }} {{ user.createdAt | date('MMMM yyyy') }}
            </ds-text>
          </ds-space>
          <ds-space v-if="user.badges && user.badges.length" margin="x-small">
            <hc-badges :badges="user.badges" />
          </ds-space>
          <ds-flex>
            <ds-flex-item>
              <client-only>
                <ds-number :label="$t('profile.followers')">
                  <hc-count-to
                    slot="count"
                    :start-val="followedByCountStartValue"
                    :end-val="user.followedByCount"
                  />
                </ds-number>
              </client-only>
            </ds-flex-item>
            <ds-flex-item>
              <client-only>
                <ds-number :label="$t('profile.following')">
                  <hc-count-to slot="count" :end-val="user.followingCount" />
                </ds-number>
              </client-only>
            </ds-flex-item>
          </ds-flex>
          <div v-if="!myProfile" class="action-buttons">
            <base-button v-if="user.isBlocked" @click="unblockUser(user)">
              {{ $t('settings.blocked-users.unblock') }}
            </base-button>
            <base-button v-if="user.isMuted" @click="unmuteUser(user)">
              {{ $t('settings.muted-users.unmute') }}
            </base-button>
            <hc-follow-button
              v-if="!user.isMuted && !user.isBlocked"
              :follow-id="user.id"
              :is-followed="user.followedByCurrentUser"
              @optimistic="optimisticFollow"
              @update="updateFollow"
            />
          </div>
          <template v-if="user.about">
            <hr />
            <ds-space margin-top="small" margin-bottom="small">
              <ds-text color="soft" size="small" class="hyphenate-text">{{ user.about }}</ds-text>
            </ds-space>
          </template>
        </base-card>
        <ds-space />
        <ds-heading tag="h3" soft style="text-align: center; margin-bottom: 10px;">
          {{ $t('profile.network.title') }}
        </ds-heading>
        <follow-list
          :loading="$apollo.loading"
          :user="user"
          type="followedBy"
          @fetchAllConnections="fetchAllConnections"
        />
        <ds-space />
        <follow-list
          :loading="$apollo.loading"
          :user="user"
          type="following"
          @fetchAllConnections="fetchAllConnections"
        />
        <ds-space v-if="user.socialMedia && user.socialMedia.length" margin="large">
          <base-card style="position: relative; height: auto;">
            <ds-space margin="x-small">
              <ds-text tag="h5" color="soft">
                {{ $t('profile.socialMedia') }} {{ userName | truncate(15) }}?
              </ds-text>
              <template>
                <ds-space v-for="link in socialMediaLinks" :key="link.username" margin="x-small">
                  <a :href="link.url" target="_blank">
                    <user-avatar :image="link.favicon" />
                    {{ link.username }}
                  </a>
                </ds-space>
              </template>
            </ds-space>
          </base-card>
        </ds-space>
      </ds-flex-item>

      <ds-flex-item :width="{ base: '100%', sm: 3, md: 5, lg: 3 }">
        <masonry-grid>
          <ds-grid-item class="profile-top-navigation" :row-span="3" column-span="fullWidth">
            <base-card class="ds-tab-nav">
              <ul class="Tabs">
                <li class="Tabs__tab pointer" :class="{ active: tabActive === 'post' }">
                  <a @click="handleTab('post')">
                    <ds-space margin="small">
                      <client-only placeholder="Loading...">
                        <ds-number :label="$t('common.post', null, user.contributionsCount)">
                          <hc-count-to slot="count" :end-val="user.contributionsCount" />
                        </ds-number>
                      </client-only>
                    </ds-space>
                  </a>
                </li>
                <li class="Tabs__tab pointer" :class="{ active: tabActive === 'comment' }">
                  <a @click="handleTab('comment')">
                    <ds-space margin="small">
                      <client-only placeholder="Loading...">
                        <ds-number :label="$t('profile.commented')">
                          <hc-count-to slot="count" :end-val="user.commentedCount" />
                        </ds-number>
                      </client-only>
                    </ds-space>
                  </a>
                </li>
                <li
                  class="Tabs__tab pointer"
                  :class="{ active: tabActive === 'shout' }"
                  v-if="myProfile || user.showShoutsPublicly"
                >
                  <a @click="handleTab('shout')">
                    <ds-space margin="small">
                      <client-only placeholder="Loading...">
                        <ds-number :label="$t('profile.shouted')">
                          <hc-count-to slot="count" :end-val="user.shoutedCount" />
                        </ds-number>
                      </client-only>
                    </ds-space>
                  </a>
                </li>
              </ul>
            </base-card>
          </ds-grid-item>

          <ds-grid-item :row-span="2" column-span="fullWidth">
            <ds-space centered>
              <nuxt-link :to="{ name: 'post-create' }">
                <base-button
                  v-if="myProfile"
                  v-tooltip="{
                    content: $t('contribution.newPost'),
                    placement: 'left',
                    delay: { show: 500 },
                  }"
                  :path="{ name: 'post-create' }"
                  class="profile-post-add-button"
                  icon="plus"
                  circle
                  filled
                />
              </nuxt-link>
            </ds-space>
          </ds-grid-item>

          <template v-if="posts.length">
            <masonry-grid-item
              v-for="post in posts"
              :key="post.id"
              :imageAspectRatio="post.image && post.image.aspectRatio"
            >
              <post-teaser
                :post="post"
                :width="{ base: '100%', md: '100%', xl: '50%' }"
                @removePostFromList="removePostFromList"
                @pinPost="pinPost"
                @unpinPost="unpinPost"
              />
            </masonry-grid-item>
          </template>
          <template v-else-if="$apollo.loading">
            <ds-grid-item column-span="fullWidth">
              <ds-space centered>
                <ds-spinner size="base"></ds-spinner>
              </ds-space>
            </ds-grid-item>
          </template>
          <template v-else>
            <ds-grid-item column-span="fullWidth">
              <hc-empty margin="xx-large" icon="file" />
            </ds-grid-item>
          </template>
        </masonry-grid>
        <client-only>
          <infinite-loading v-if="hasMore" @infinite="showMoreContributions" />
        </client-only>
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
import uniqBy from 'lodash/uniqBy'
import PostTeaser from '~/components/PostTeaser/PostTeaser.vue'
import HcFollowButton from '~/components/FollowButton.vue'
import HcCountTo from '~/components/CountTo.vue'
import HcBadges from '~/components/Badges.vue'
import FollowList from '~/components/features/FollowList/FollowList'
import HcEmpty from '~/components/Empty/Empty'
import ContentMenu from '~/components/ContentMenu/ContentMenu'
import HcUpload from '~/components/Upload'
import UserAvatar from '~/components/_new/generic/UserAvatar/UserAvatar'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid.vue'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem.vue'
import { profilePagePosts } from '~/graphql/PostQuery'
import UserQuery from '~/graphql/User'
import { muteUser, unmuteUser } from '~/graphql/settings/MutedUsers'
import { blockUser, unblockUser } from '~/graphql/settings/BlockedUsers'
import PostMutations from '~/graphql/PostMutations'
import UpdateQuery from '~/components/utils/UpdateQuery'

const tabToFilterMapping = ({ tab, id }) => {
  return {
    post: { author: { id } },
    comment: { comments_some: { author: { id } } },
    shout: { shoutedBy_some: { id } },
  }[tab]
}

export default {
  components: {
    PostTeaser,
    HcFollowButton,
    HcCountTo,
    HcBadges,
    HcEmpty,
    UserAvatar,
    ContentMenu,
    HcUpload,
    MasonryGrid,
    MasonryGridItem,
    FollowList,
  },
  transition: {
    name: 'slide-up',
    mode: 'out-in',
  },
  data() {
    const filter = tabToFilterMapping({ tab: 'post', id: this.$route.params.id })
    return {
      User: [],
      posts: [],
      hasMore: true,
      offset: 0,
      pageSize: 6,
      tabActive: 'post',
      filter,
      followedByCountStartValue: 0,
      followedByCount: 7,
      followingCount: 7,
    }
  },
  computed: {
    myProfile() {
      return this.$route.params.id === this.$store.getters['auth/user'].id
    },
    user() {
      return this.User ? this.User[0] : {}
    },
    socialMediaLinks() {
      const { socialMedia = [] } = this.user
      return socialMedia.map((socialMedia) => {
        const { url } = socialMedia
        const matches = url.match(/^(?:https?:\/\/)?(?:[^@\n])?(?:www\.)?([^:/\n?]+)/g)
        const [domain] = matches || []
        const favicon = domain ? `${domain}/favicon.ico` : null
        const username = url.split('/').pop()
        return { url, username, favicon }
      })
    },
    userName() {
      const { name } = this.user || {}
      return name || this.$t('profile.userAnonym')
    },
    userSlug() {
      const { slug } = this.user || {}
      return slug && `@${slug}`
    },
  },
  methods: {
    removePostFromList(deletedPost) {
      this.posts = this.posts.filter((post) => {
        return post.id !== deletedPost.id
      })
    },
    handleTab(tab) {
      this.tabActive = tab
      this.filter = tabToFilterMapping({ tab, id: this.$route.params.id })
      this.resetPostList()
    },
    uniq(items, field = 'id') {
      return uniqBy(items, field)
    },
    showMoreContributions($state) {
      const { profilePagePosts: PostQuery } = this.$apollo.queries
      if (!PostQuery) return // seems this can be undefined on subpages
      this.offset += this.pageSize

      PostQuery.fetchMore({
        variables: {
          offset: this.offset,
          filter: this.filter,
          first: this.pageSize,
          orderBy: 'createdAt_desc',
        },
        updateQuery: UpdateQuery(this, { $state, pageKey: 'profilePagePosts' }),
      })
    },
    resetPostList() {
      this.offset = 0
      this.posts = []
      this.hasMore = true
    },
    async muteUser(user) {
      try {
        await this.$apollo.mutate({ mutation: muteUser(), variables: { id: user.id } })
      } catch (error) {
        this.$toast.error(error.message)
      } finally {
        this.$apollo.queries.User.refetch()
        this.resetPostList()
        this.$apollo.queries.profilePagePosts.refetch()
      }
    },
    async unmuteUser(user) {
      try {
        this.$apollo.mutate({ mutation: unmuteUser(), variables: { id: user.id } })
      } catch (error) {
        this.$toast.error(error.message)
      } finally {
        this.$apollo.queries.User.refetch()
        this.resetPostList()
        this.$apollo.queries.profilePagePosts.refetch()
      }
    },
    async blockUser(user) {
      try {
        await this.$apollo.mutate({ mutation: blockUser(), variables: { id: user.id } })
      } catch (error) {
        this.$toast.error(error.message)
      } finally {
        this.$apollo.queries.User.refetch()
      }
    },
    async unblockUser(user) {
      try {
        this.$apollo.mutate({ mutation: unblockUser(), variables: { id: user.id } })
      } catch (error) {
        this.$toast.error(error.message)
      } finally {
        this.$apollo.queries.User.refetch()
      }
    },
    async deleteUser(userdata) {
      this.$store.commit('modal/SET_OPEN', {
        name: 'delete',
        data: {
          userdata: userdata,
        },
      })
    },
    pinPost(post) {
      this.$apollo
        .mutate({
          mutation: PostMutations().pinPost,
          variables: { id: post.id },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.pinnedSuccessfully'))
          this.resetPostList()
          this.$apollo.queries.profilePagePosts.refetch()
        })
        .catch((error) => this.$toast.error(error.message))
    },
    unpinPost(post) {
      this.$apollo
        .mutate({
          mutation: PostMutations().unpinPost,
          variables: { id: post.id },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.unpinnedSuccessfully'))
          this.resetPostList()
          this.$apollo.queries.profilePagePosts.refetch()
        })
        .catch((error) => this.$toast.error(error.message))
    },
    optimisticFollow({ followedByCurrentUser }) {
      /*
       * Note: followedByCountStartValue is updated to avoid counting from 0 when follow/unfollow
       */
      this.followedByCountStartValue = this.user.followedByCount
      const currentUser = this.$store.getters['auth/user']
      if (followedByCurrentUser) {
        this.user.followedByCount++
        this.user.followedBy = [currentUser, ...this.user.followedBy]
      } else {
        this.user.followedByCount--
        this.user.followedBy = this.user.followedBy.filter((user) => user.id !== currentUser.id)
      }
      this.user.followedByCurrentUser = followedByCurrentUser
    },
    updateFollow({ followedByCurrentUser, followedBy, followedByCount }) {
      this.followedByCountStartValue = this.user.followedByCount
      this.user.followedByCount = followedByCount
      this.user.followedByCurrentUser = followedByCurrentUser
      this.user.followedBy = followedBy
    },
    fetchAllConnections(type) {
      if (type === 'following') this.followingCount = Infinity
      if (type === 'followedBy') this.followedByCount = Infinity
    },
  },
  apollo: {
    profilePagePosts: {
      query() {
        return profilePagePosts(this.$i18n)
      },
      variables() {
        return {
          filter: this.filter,
          first: this.pageSize,
          offset: 0,
          orderBy: 'createdAt_desc',
        }
      },
      update({ profilePagePosts }) {
        this.posts = profilePagePosts
      },
      fetchPolicy: 'cache-and-network',
    },
    User: {
      query() {
        return UserQuery(this.$i18n)
      },
      variables() {
        return {
          id: this.$route.params.id,
          followedByCount: this.followedByCount,
          followingCount: this.followingCount,
        }
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.pointer {
  cursor: pointer;
}

.Tabs {
  position: relative;
  background-color: #fff;
  height: 100%;
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;

  &__tab {
    text-align: center;
    height: 100%;
    flex-grow: 1;

    &:hover {
      border-bottom: 2px solid #c9c6ce;
    }

    &.active {
      border-bottom: 2px solid #17b53f;
    }
  }
}
.profile-avatar.user-avatar {
  margin: auto;
  margin-top: -60px;
}
.page-name-profile-id-slug {
  .ds-flex-item:first-child .content-menu {
    position: absolute;
    top: $space-x-small;
    right: $space-x-small;
  }
}
.profile-top-navigation {
  position: sticky;
  top: 53px;
  z-index: 2;
}
.ds-tab-nav.base-card {
  padding: 0;

  .ds-tab-nav-item {
    &.ds-tab-nav-item-active {
      border-bottom: 3px solid #17b53f;
      &:first-child {
        border-bottom-left-radius: $border-radius-x-large;
      }
      &:last-child {
        border-bottom-right-radius: $border-radius-x-large;
      }
    }
  }
}
.profile-post-add-button {
  box-shadow: $box-shadow-x-large;
}
.action-buttons {
  margin: $space-small 0;

  > .base-button {
    display: block;
    width: 100%;
    margin-bottom: $space-x-small;
  }
}
</style>
