<template>
  <div>
    <ds-card v-if="user && user.image">
      <p>PROFILE IMAGE</p>
    </ds-card>
    <ds-space/>
    <ds-flex
      v-if="user"
      :width="{ base: '100%' }"
      gutter="base">
      <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
        <ds-card style="position: relative; height: auto;">
          <ds-avatar
            :image="user.avatar"
            :name="user.name || 'Anonymus'"
            class="profile-avatar"
            size="120px" />
          <ds-space margin="small">
            <ds-heading
              tag="h3"
              align="center"
              no-margin>{{ user.name }}</ds-heading>
          </ds-space>
          <ds-space
            v-if="user.badges && user.badges.length"
            margin="x-small">
            <hc-badges
              :badges="user.badges" />
          </ds-space>
          <ds-flex>
            <ds-flex-item>
              <no-ssr>
                <ds-number label="Fans">
                  <hc-count-to
                    slot="count"
                    :end-val="fanCount" />
                </ds-number>
              </no-ssr>
            </ds-flex-item>
            <ds-flex-item>
              <no-ssr>
                <ds-number label="Freunde">
                  <hc-count-to
                    slot="count"
                    :end-val="user.friendsCount" />
                </ds-number>
              </no-ssr>
            </ds-flex-item>
          </ds-flex>
          <ds-space
            margin="small">
            <hc-follow-button
              v-if="!myProfile"
              :follow-id="user.id"
              @update="voted = true && fetchUser()" />
          </ds-space>
        </ds-card>
        <ds-space/>
        <ds-heading
          tag="h3"
          soft
          style="text-align: center; margin-bottom: 10px;">
          Netzwerk
        </ds-heading>
        <ds-card style="position: relative; height: auto;">
          <ds-space
            v-if="user.following && user.following.length"
            margin="x-small">
            <ds-text
              tag="h5"
              color="soft">
              Wem folgt {{ user.name | truncate(15) }}?
            </ds-text>
          </ds-space>
          <template v-if="user.following && user.following.length">
            <ds-space
              v-for="follow in user.following"
              :key="follow.id"
              margin="x-small">
              <!-- TODO: find better solution for rendering errors -->
              <no-ssr>
                <hc-related-user
                  :post="follow"
                  :trunc="15" />
              </no-ssr>
            </ds-space>
            <ds-space
              v-if="user.followingCount - user.following.length"
              margin="small">
              <ds-text
                size="small"
                color="softer">und {{ user.followingCount - user.following.length }} weitere</ds-text>
            </ds-space>
          </template>
          <template v-else>
            <p style="text-align: center; opacity: .5;">{{ user.name }} folgt niemandem</p>
          </template>
        </ds-card>
        <ds-space/>
        <ds-card style="position: relative; height: auto;">
          <ds-space
            v-if="user.followedBy && user.followedBy.length"
            margin="x-small">
            <ds-text
              tag="h5"
              color="soft">
              Wer folgt {{ user.name | truncate(15) }}?
            </ds-text>
          </ds-space>
          <template v-if="user.followedBy && user.followedBy.length">
            <ds-space
              v-for="follow in user.followedBy"
              :key="follow.id"
              margin="x-small">
              <!-- TODO: find better solution for rendering errors -->
              <no-ssr>
                <hc-related-user
                  :post="follow"
                  :trunc="15" />
              </no-ssr>
            </ds-space>
            <ds-space
              v-if="user.followedByCount - user.followedBy.length"
              margin="small">
              <ds-text
                size="small"
                color="softer">und {{ user.followedByCount - user.followedBy.length }} weitere</ds-text>
            </ds-space>
          </template>
          <template v-else>
            <p style="text-align: center; opacity: .5;">niemand folgt {{ user.name }}</p>
          </template>
        </ds-card>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '100%', sm: 3, md: 5, lg: 3 }">
        <ds-flex
          :width="{ base: '100%' }"
          gutter="small">
          <ds-flex-item>
            <ds-card class="ds-tab-nav">
              <ds-flex>
                <ds-flex-item class="ds-tab-nav-item ds-tab-nav-item-active">
                  <ds-space margin="small">
                    <!-- TODO: find better solution for rendering errors -->
                    <no-ssr>
                      <ds-number label="Beiträge">
                        <hc-count-to
                          slot="count"
                          :end-val="user.contributionsCount" />
                      </ds-number>
                    </no-ssr>
                  </ds-space>
                </ds-flex-item>
                <ds-flex-item class="ds-tab-nav-item">
                  <ds-space margin="small">
                    <!-- TODO: find better solution for rendering errors -->
                    <no-ssr>
                      <ds-number label="Kommentiert">
                        <hc-count-to
                          slot="count"
                          :end-val="user.commentsCount" />
                      </ds-number>
                    </no-ssr>
                  </ds-space>
                </ds-flex-item>
                <ds-flex-item class="ds-tab-nav-item">
                  <ds-space margin="small">
                    <!-- TODO: find better solution for rendering errors -->
                    <no-ssr>
                      <ds-number label="Empfohlen">
                        <hc-count-to
                          slot="count"
                          :end-val="user.shoutedCount" />
                      </ds-number>
                    </no-ssr>
                  </ds-space>
                </ds-flex-item>
              </ds-flex>
            </ds-card>
          </ds-flex-item>
          <ds-flex-item
            v-for="post in user.contributions"
            :width="{ base: '100%', md: '100%', xl: '50%' }"
            :key="post.id">
            <hc-post-card
              :post="post"
              :show-author-popover="false" />
          </ds-flex-item>
        </ds-flex>
        <ds-space
          v-if="hasMore"
          margin-top="large"
          style="text-align: center">
          <ds-button
            icon="arrow-down"
            ghost
            @click="showMoreContributions">
            mehr laden
          </ds-button>
        </ds-space>
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
import HcRelatedUser from '~/components/RelatedUser.vue'
import HcPostCard from '~/components/PostCard.vue'
import HcFollowButton from '~/components/FollowButton.vue'
import HcCountTo from '~/components/CountTo.vue'
import HcBadges from '~/components/Badges.vue'

export default {
  components: {
    HcRelatedUser,
    HcPostCard,
    HcFollowButton,
    HcCountTo,
    HcBadges
  },
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },
  data() {
    return {
      User: [],
      voted: false,
      page: 1,
      pageSize: 6
    }
  },
  computed: {
    myProfile() {
      return this.$route.params.slug === this.$store.getters['auth/user'].slug
    },
    fanCount() {
      let count = Number(this.user.followedByCount) || 0
      if (this.voted) {
        // NOTE: this is used for presentation
        count += 1
      }
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
        this.user.contributions &&
        this.user.contributions.length < this.user.contributionsCount
      )
    }
  },
  watch: {
    User(val) {
      if (!val || !val.length) {
        throw new Error('User not found!')
      }
    }
  },
  methods: {
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
          offset: this.offset
        },
        // Transform the previous result with new data
        updateQuery: (previousResult, { fetchMoreResult }) => {
          let output = { User: this.User }
          output.User[0].contributions = [
            ...previousResult.User[0].contributions,
            ...fetchMoreResult.User[0].contributions
          ]
          return output
        }
      })
    }
  },
  apollo: {
    User: {
      query: require('~/graphql/UserProfileQuery.js').default,
      variables() {
        return {
          slug: this.$route.params.slug,
          first: this.pageSize,
          offset: 0
        }
      }
    }
  }
}
</script>

<style lang="scss">
@import 'vue-cion-design-system/src/system/tokens/generated/tokens.scss';

.profile-avatar {
  display: block;
  margin: auto;
  margin-top: -60px;
  border: #fff 5px solid;
}

.ds-tab-nav {
  .ds-card-content {
    padding: 0 !important;

    .ds-tab-nav-item {
      &.ds-tab-nav-item-active {
        border-bottom: 3px solid #17b53f;
        &:first-child {
          border-bottom-left-radius: $border-radius-large;
        }
        &:last-child {
          border-bottom-right-radius: $border-radius-large;
        }
      }
    }
  }
}
</style>
