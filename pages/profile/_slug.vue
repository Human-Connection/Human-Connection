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
        <ds-flex-item :width="{ base: '30%' }">
          <ds-card style="position: relative; height: auto;">
            <ds-avatar
              :image="user.avatar"
              class="profile-avatar"
              size="120px" />
            <h3 style="text-align: center;">{{ user.name }}</h3>
            <ds-space/>
            <ds-flex :size="{ base: '100%' }">
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
            <ds-space margin-bottom="small"/>
          </ds-card>
          <ds-space/>
          <h2 style="text-align: center; margin-bottom: 10px;">Netzwerk</h2>
          <ds-card style="position: relative; height: auto;">
            <template v-if="user.friends.length">
              <ds-space
                v-for="friend in user.friends"
                :key="friend.id"
                margin-top="x-small"
                margin-bottom="x-small">
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
        <ds-flex-item :width="{ base: '70%' }">
          <ds-flex
            :width="{ base: '100%' }"
            gutter="small">
            <ds-flex-item
              v-for="item in user.contributions"
              :width="{ base: '100%', md: '100%', xl: '50%' }"
              :key="item.Post.id">
              <a
                v-router-link
                :href="href(item.Post)"
              >
                <ds-card
                  :header="item.Post.title"
                  :image="item.Post.image"
                  style="cursor: pointer">
                  <div v-html="item.Post.contentExcerpt" />
                  <template slot="footer">
                    <span>
                      <ds-icon name="comments" /> <small v-if="item.Post.commentsCount">{{ item.Post.commentsCount }}</small>
                    </span>
                    &nbsp;
                    <span>
                      <ds-icon name="heart-o" /> <small v-if="item.Post.shoutedCount">{{ item.Post.shoutedCount }}</small>
                    </span>
                  </template>
                </ds-card>
              </a>
            </ds-flex-item>
          </ds-flex>
        </ds-flex-item>
      </ds-flex>
    </no-ssr>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
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
    href(post) {
      return this.$router.resolve({
        name: 'post-slug',
        params: { slug: post.slug }
      }).href
    }
  },
  apollo: {
    User: {
      query: gql(`
        query User($slug: String!) {
          User(slug: $slug) {
            id
            name
            avatar
            friendsCount
            friends {
              id
              name
              slug
              avatar
            }
            badgesCount
            followingCount
            followedByCount
            contributionsCount
            contributions {
              Post {
                id
                slug
                title
                contentExcerpt
                shoutedCount
                commentsCount
                image
              }
            }
          }
        }
      `),
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
