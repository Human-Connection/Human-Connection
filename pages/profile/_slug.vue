<template>
  <div>
    <ds-card v-if="user && user.image">
      <p>PROFILE IMAGE</p>
    </ds-card>
    <no-ssr>
      <ds-space/>
      <ds-flex
        v-if="user"
        :width="{ base: '100%' }"
        gutter="base">
        <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
          <ds-card style="position: relative; height: auto;">
            <ds-avatar
              :image="user.avatar"
              class="profile-avatar"
              size="120px" />
            <h3 style="text-align: center;">{{ user.name }}</h3>
            <ds-space/>
            <ds-flex>
              <ds-flex-item style="text-align: center;">
                <ds-text
                  size="x-large"
                  style="margin-bottom: 0;">{{ user.followedByCount }}</ds-text>
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
                :follow-id="user.id"
                @update="fetchUser" />
            </ds-space>
          </ds-card>
          <ds-space/>
          <h2 style="text-align: center; margin-bottom: 10px;">Netzwerk</h2>
          <ds-card style="position: relative; height: auto;">
            <template v-if="user.friends.length">
              <ds-space
                v-for="friend in user.friends"
                :key="friend.id"
                margin="x-small">
                <a
                  v-router-link
                  :href="$router.resolve({ name: 'profile-slug', params: { slug: friend.slug } }).href">
                  <ds-avatar
                    :image="friend.avatar"
                    size="32px" /> <b class="username">{{ friend.name }}</b>
                </a>
              </ds-space>
            </template>
            <template v-else>
              <p style="text-align: center; opacity: .5;">NO FRIENDS</p>
            </template>
          </ds-card>
        </ds-flex-item>
        <ds-flex-item :width="{ base: '100%', sm: 3, md: 5, lg: 3 }">
          <ds-flex
            :width="{ base: '100%' }"
            gutter="small">
            <ds-flex-item
              v-for="{ Post } in user.contributions"
              :width="{ base: '100%', md: '100%', xl: '50%' }"
              :key="Post.id">
              <hc-post-card :post="Post" />
            </ds-flex-item>
          </ds-flex>
        </ds-flex-item>
      </ds-flex>
    </no-ssr>
  </div>

</template>

<script>
import HcPostCard from '~/components/PostCard.vue'
import HcFollowButton from '~/components/FollowButton.vue'

export default {
  components: {
    HcPostCard,
    HcFollowButton
  },
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },

  data() {
    return {
      User: []
    }
  },
  computed: {
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
.profile-avatar {
  display: block;
  margin: auto;
  margin-top: -60px;
  border: #fff 5px solid;
}
</style>
