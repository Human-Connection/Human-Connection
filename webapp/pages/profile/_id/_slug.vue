<template>
  <div>
    <ds-card v-if="user && user.image">
      <p>PROFILE IMAGE</p>
    </ds-card>
    <ds-space />
    <ds-flex v-if="user" :width="{ base: '100%' }" gutter="base">
      <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
        <ds-card
          :class="{ 'disabled-content': user.disabled }"
          style="position: relative; height: auto;"
        >
          <hc-upload v-if="myProfile" :user="user" />
          <hc-avatar v-else :user="user" class="profile-avatar" size="x-large" />
          <no-ssr>
            <content-menu
              placement="bottom-end"
              resource-type="user"
              :resource="user"
              :callbacks="{ confirm: deletePostCallback, cancel: null }"
              :is-owner="myProfile"
              class="user-content-menu"
            />
          </no-ssr>
          <ds-space margin="small">
            <ds-heading tag="h3" align="center" no-margin>{{ userName }}</ds-heading>
            <ds-text v-if="user.location" align="center" color="soft" size="small">
              <ds-icon name="map-marker" />
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
              <no-ssr>
                <ds-number :label="$t('profile.followers')">
                  <hc-count-to slot="count" :end-val="followedByCount" />
                </ds-number>
              </no-ssr>
            </ds-flex-item>
            <ds-flex-item>
              <no-ssr>
                <ds-number :label="$t('profile.following')">
                  <hc-count-to slot="count" :end-val="Number(user.followingCount) || 0" />
                </ds-number>
              </no-ssr>
            </ds-flex-item>
          </ds-flex>
          <ds-space margin="small">
            <hc-follow-button
              v-if="!myProfile"
              :follow-id="user.id"
              :is-followed="user.followedByCurrentUser"
              @optimistic="follow => (user.followedByCurrentUser = follow)"
              @update="follow => fetchUser()"
            />
          </ds-space>
          <template v-if="user.about">
            <hr />
            <ds-space margin-top="small" margin-bottom="small">
              <ds-text color="soft" size="small">{{ user.about }}</ds-text>
            </ds-space>
          </template>
        </ds-card>
        <ds-space />
        <ds-heading tag="h3" soft style="text-align: center; margin-bottom: 10px;">
          Netzwerk
        </ds-heading>
        <ds-card style="position: relative; height: auto;">
          <ds-space v-if="user.following && user.following.length" margin="x-small">
            <ds-text tag="h5" color="soft">Wem folgt {{ userName | truncate(15) }}?</ds-text>
          </ds-space>
          <template v-if="user.following && user.following.length">
            <ds-space v-for="follow in uniq(user.following)" :key="follow.id" margin="x-small">
              <!-- TODO: find better solution for rendering errors -->
              <no-ssr>
                <user :user="follow" :trunc="15" />
              </no-ssr>
            </ds-space>
            <ds-space v-if="user.followingCount - user.following.length" margin="small">
              <ds-text size="small" color="softer">
                und {{ user.followingCount - user.following.length }} weitere
              </ds-text>
            </ds-space>
          </template>
          <template v-else>
            <p style="text-align: center; opacity: .5;">{{ userName }} folgt niemandem</p>
          </template>
        </ds-card>
        <ds-space />
        <ds-card style="position: relative; height: auto;">
          <ds-space v-if="user.followedBy && user.followedBy.length" margin="x-small">
            <ds-text tag="h5" color="soft">Wer folgt {{ userName | truncate(15) }}?</ds-text>
          </ds-space>
          <template v-if="user.followedBy && user.followedBy.length">
            <ds-space v-for="follow in uniq(user.followedBy)" :key="follow.id" margin="x-small">
              <!-- TODO: find better solution for rendering errors -->
              <no-ssr>
                <user :user="follow" :trunc="15" />
              </no-ssr>
            </ds-space>
            <ds-space v-if="user.followedByCount - user.followedBy.length" margin="small">
              <ds-text size="small" color="softer">
                und {{ user.followedByCount - user.followedBy.length }} weitere
              </ds-text>
            </ds-space>
          </template>
          <template v-else>
            <p style="text-align: center; opacity: .5;">niemand folgt {{ userName }}</p>
          </template>
        </ds-card>
        <ds-space v-if="user.socialMedia && user.socialMedia.length" margin="large">
          <ds-card style="position: relative; height: auto;">
            <ds-space margin="x-small">
              <ds-text tag="h5" color="soft">
                {{ $t('profile.socialMedia') }} {{ user.name | truncate(15) }}?
              </ds-text>
              <template>
                <ds-space v-for="link in socialMediaLinks" :key="link.username" margin="x-small">
                  <a :href="link.url">
                    <ds-avatar :image="link.favicon" />
                    {{ 'link.username' }}
                  </a>
                </ds-space>
              </template>
            </ds-space>
          </ds-card>
        </ds-space>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '100%', sm: 3, md: 5, lg: 3 }">
        <ds-flex :width="{ base: '100%' }" gutter="small">
          <ds-flex-item class="profile-top-navigation">
            <ds-card class="ds-tab-nav">
              <ds-flex>
                <ds-flex-item
                  v-tooltip="{
                    content: $t('common.your.post', null, user.contributionsCount),
                    placement: 'right',
                    delay: { show: 500 },
                  }"
                  class="ds-tab-nav-item pointer ds-tab-nav-item-active"
                >
                  <a @click="handleTab('posts', $event)">
                    <ds-space margin="small">
                      <!-- TODO: find better solution for rendering errors -->

                      <ds-number :label="$t('common.post', null, user.contributionsCount)">
                        <hc-count-to slot="count" :end-val="user.contributionsCount" />
                      </ds-number>
                    </ds-space>
                  </a>
                </ds-flex-item>
                <ds-flex-item
                  v-tooltip="{
                    content: $t('common.your.comment', null, user.commentsCount),
                    placement: 'right',
                    delay: { show: 500 },
                  }"
                  class="ds-tab-nav-item pointer"
                >
                  <a @click="handleTab('commented', $event)">
                    <ds-space margin="small">
                      <!-- TODO: find better solution for rendering errors -->

                      <no-ssr>
                        <ds-number :label="$t('profile.commented')">
                          <hc-count-to slot="count" :end-val="user.commentsCount" />
                        </ds-number>
                      </no-ssr>
                    </ds-space>
                  </a>
                </ds-flex-item>

                <ds-flex-item
                  v-tooltip="{
                    content: $t('common.your.shouted', null, user.shoutedCount),
                    placement: 'right',
                    delay: { show: 500 },
                  }"
                  class="ds-tab-nav-item pointer"
                >
                  <a @click="handleShoutedTab">
                    <ds-space margin="small">
                      <!-- TODO: find better solution for rendering errors -->
                      <no-ssr>
                        <ds-number :label="$t('profile.shouted')">
                          <hc-count-to slot="count" :end-val="user.shoutedCount" />
                        </ds-number>
                      </no-ssr>
                    </ds-space>
                  </a>
                </ds-flex-item>
              </ds-flex>
            </ds-card>
          </ds-flex-item>
          <ds-flex-item style="text-align: center">
            <ds-button
              v-if="myProfile"
              v-tooltip="{ content: 'Create a new Post', placement: 'left', delay: { show: 500 } }"
              :path="{ name: 'post-create' }"
              class="profile-post-add-button"
              icon="plus"
              size="large"
              primary
            />
          </ds-flex-item>
          <template v-if="activePosts.length">
            <hc-post-card
              v-for="(post, index) in activePosts"
              :key="post.id"
              :post="post"
              :width="{ base: '100%', md: '100%', xl: '50%' }"
              @deletePost="user.contributions.splice(index, 1)"
            />
          </template>
          <template v-else>
            <ds-flex-item :width="{ base: '100%' }">
              <hc-empty margin="xx-large" icon="file" />
            </ds-flex-item>
          </template>
        </ds-flex>
        <hc-load-more v-if="hasMore" :loading="$apollo.loading" @click="showMoreContributions" />
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
import uniqBy from 'lodash/uniqBy'

import User from '~/components/User'
import HcPostCard from '~/components/PostCard'
import HcFollowButton from '~/components/FollowButton.vue'
import HcCountTo from '~/components/CountTo.vue'
import HcBadges from '~/components/Badges.vue'
import HcLoadMore from '~/components/LoadMore.vue'
import HcEmpty from '~/components/Empty.vue'
import ContentMenu from '~/components/ContentMenu'
import HcUpload from '~/components/Upload'
import HcAvatar from '~/components/Avatar/Avatar.vue'
import PostMutationHelpers from '~/mixins/PostMutationHelpers'

export default {
  components: {
    User,
    HcPostCard,
    HcFollowButton,
    HcCountTo,
    HcBadges,
    HcLoadMore,
    HcEmpty,
    HcAvatar,
    ContentMenu,
    HcUpload,
  },
  mixins: [PostMutationHelpers],
  transition: {
    name: 'slide-up',
    mode: 'out-in',
  },
  data() {
    return {
      User: [],
      voted: false,
      page: 1,
      pageSize: 6,
    }
  },
  computed: {
    myProfile() {
      return this.$route.params.slug === this.$store.getters['auth/user'].slug
    },
    followedByCount() {
      let count = Number(this.user.followedByCount) || 0
      return count
    },
    user() {
      return this.User ? this.User[0] : {}
    },
    offset() {
      return (this.page - 1) * this.pageSize
    },
    hasMore() {
      return (
        this.user.contributions && this.user.contributions.length < this.user.contributionsCount
      )
    },
    activePosts() {
      if (!this.user.contributions) {
        return []
      }
      return this.uniq(this.user.contributions.filter(post => !post.deleted))
    },
    socialMediaLinks() {
      const { socialMedia = [] } = this.user
      return socialMedia.map(socialMedia => {
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
  },
  watch: {
    User(val) {
      if (!val || !val.length) {
        throw new Error('User not found!')
      }
    },
  },
  methods: {
    handleShoutedTab() {},
    handleCommentedTab() {},
    handlePostTab() {}


      switch (tab) {
        case 'posts':
          this.$toast.info('!load posts here!')
          break
        case 'commented':
          this.$toast.info('!load commented here!')
          break
        case 'shouted':
          this.$toast.info('!load shouted here!')
          break
      }
    },
    uniq(items, field = 'id') {
      return uniqBy(items, field)
    },
    fetchUser() {
      // TODO: we should use subscriptions instead of fetching the whole user again
      this.$apollo.queries.User.refetch()
    },
    showMoreContributions() {
      // this.page++
      // Fetch more data and transform the original result
      this.page++
      this.$apollo.queries.User.fetchMore({
        variables: {
          slug: this.$route.params.slug,
          first: this.pageSize,
          offset: this.offset,
        },
        // Transform the previous result with new data
        updateQuery: (previousResult, { fetchMoreResult }) => {
          let output = { User: this.User }
          output.User[0].contributions = [
            ...previousResult.User[0].contributions,
            ...fetchMoreResult.User[0].contributions,
          ]
          return output
        },
        fetchPolicy: 'cache-and-network',
      })
    },
  },
  apollo: {
    User: {
      query() {
        return require('~/graphql/UserProfileQuery.js').default(this)
      },
      variables() {
        return {
          slug: this.$route.params.slug,
          first: this.pageSize,
          offset: 0,
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

.ds-tab-nav .ds-card-content .ds-tab-nav-item:hover {
  border-bottom: 3px solid #c9c6ce;
}

.profile-avatar.ds-avatar {
  display: block;
  margin: auto;
  margin-top: -60px;
  border: #fff 5px solid;
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

.ds-tab-nav {
  .ds-card-content {
    padding: 0 !important;

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
}
</style>
