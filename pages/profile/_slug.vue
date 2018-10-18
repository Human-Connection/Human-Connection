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
          <h3 style="text-align: center;">{{ user.name }}</h3>
          <ds-space/>
          <ds-flex>
            <ds-flex-item style="text-align: center;">
              <ds-text
                size="x-large"
                style="margin-bottom: 0;">{{ fanCount }}</ds-text>
              <ds-text size="small">Fans</ds-text>
            </ds-flex-item>
            <ds-flex-item style="text-align: center;">
              <ds-text
                size="x-large"
                style="margin-bottom: 0;">{{ user.friendsCount }}</ds-text>
              <ds-text size="small">Freunde</ds-text>
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
        <h2 style="text-align: center; margin-bottom: 10px;">Netzwerk</h2>
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
              <hc-related-user
                :post="follow"
                :trunc="15" />
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
              <hc-related-user
                :post="follow"
                :trunc="15" />
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
                    <ds-text
                      size="x-large"
                      style="margin-bottom: 0; text-align: center">{{ user.contributionsCount }}</ds-text>
                    <ds-text
                      size="small"
                      style="text-align: center">Beiträge</ds-text>
                  </ds-space>
                </ds-flex-item>
                <ds-flex-item class="ds-tab-nav-item">
                  <ds-space margin="small">
                    <ds-text
                      size="x-large"
                      style="margin-bottom: 0; text-align: center">{{ user.commentsCount }}</ds-text>
                    <ds-text
                      size="small"
                      style="text-align: center">Kommentiert</ds-text>
                  </ds-space>
                </ds-flex-item>
                <ds-flex-item class="ds-tab-nav-item">
                  <ds-space margin="small">
                    <ds-text
                      size="x-large"
                      style="margin-bottom: 0; text-align: center">{{ user.shoutedCount }}</ds-text>
                    <ds-text
                      size="small"
                      style="text-align: center">Empfohlen</ds-text>
                  </ds-space>
                </ds-flex-item>
              </ds-flex>
            </ds-card>
          </ds-flex-item>
          <ds-flex-item
            v-for="{ Post } in user.contributions"
            :width="{ base: '100%', md: '100%', xl: '50%' }"
            :key="Post.id">
            <hc-post-card
              :post="Post"
              :show-author-popover="false" />
          </ds-flex-item>
        </ds-flex>
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
import HcRelatedUser from '~/components/RelatedUser.vue'
import HcPostCard from '~/components/PostCard.vue'
import HcFollowButton from '~/components/FollowButton.vue'

export default {
  components: {
    HcRelatedUser,
    HcPostCard,
    HcFollowButton
  },
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },
  data() {
    return {
      User: [],
      voted: false
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
    }
  },
  methods: {
    fetchUser() {
      // TODO: we should use subscriptions instead of fetching the whole user again
      this.$apollo.queries.User.refetch()
    }
  },
  apollo: {
    User: {
      query: require('~/graphql/UserProfileQuery.js').default,
      variables() {
        return {
          slug: this.$route.params.slug
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
