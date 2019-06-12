<template>
  <div>
    <ds-flex :width="{ base: '100%' }" gutter="base">
      <ds-flex-item>
        <filter-menu :user="currentUser" @changeFilterBubble="changeFilterBubble" />
      </ds-flex-item>
      <hc-post-card
        v-for="(post, index) in uniq(Post)"
        :key="post.id"
        :post="post"
        :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
        @removePostFromList="deletePost(index, post.id)"
      />
    </ds-flex>
    <no-ssr>
      <ds-button
        v-tooltip="{ content: 'Create a new Post', placement: 'left', delay: { show: 500 } }"
        :path="{ name: 'post-create' }"
        class="post-add-button"
        icon="plus"
        size="x-large"
        primary
      />
    </no-ssr>
    <hc-load-more v-if="true" :loading="$apollo.loading" @click="showMoreContributions" />
  </div>
</template>

<script>
import FilterMenu from '~/components/FilterMenu/FilterMenu.vue'
import gql from 'graphql-tag'
import uniqBy from 'lodash/uniqBy'
import HcPostCard from '~/components/PostCard'
import HcLoadMore from '~/components/LoadMore.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    FilterMenu,
    HcPostCard,
    HcLoadMore,
  },
  data() {
    return {
      // Initialize your apollo data
      Post: [],
      page: 1,
      pageSize: 10,
      filter: {},
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    tags() {
      return this.Post ? this.Post[0].tags.map(tag => tag.name) : '-'
    },
    offset() {
      return (this.page - 1) * this.pageSize
    },
  },
  methods: {
    changeFilterBubble(filter) {
      this.filter = filter
      this.$apollo.queries.Post.refresh()
    },
    uniq(items, field = 'id') {
      return uniqBy(items, field)
    },
    href(post) {
      return this.$router.resolve({
        name: 'post-id-slug',
        params: { id: post.id, slug: post.slug },
      }).href
    },
    showMoreContributions() {
      // this.page++
      // Fetch more data and transform the original result
      this.page++
      this.$apollo.queries.Post.fetchMore({
        variables: {
          filter: this.filter,
          first: this.pageSize,
          offset: this.offset,
        },
        // Transform the previous result with new data
        updateQuery: (previousResult, { fetchMoreResult }) => {
          let output = { Post: this.Post }
          output.Post = [...previousResult.Post, ...fetchMoreResult.Post]
          return output
        },
        fetchPolicy: 'cache-and-network',
      })
    },
    deletePost(_index, postId) {
      this.Post = this.Post.filter(post => {
        return post.id !== postId
      })
      // Why "uniq(Post)" is used in the array for list creation?
      // Ideal solution here:
      // this.Post.splice(index, 1)
    },
  },
  apollo: {
    Post: {
      query() {
        return gql(`
          query Post($filter: _PostFilter, $first: Int, $offset: Int) {
            Post(filter: $filter, first: $first, offset: $offset) {
              id
              title
              contentExcerpt
              createdAt
              disabled
              deleted
              slug
              image
              author {
                id
                avatar
                slug
                name
                disabled
                deleted
                contributionsCount
                shoutedCount
                commentsCount
                followedByCount
                followedByCurrentUser
                location {
                  name: name${this.$i18n.locale().toUpperCase()}
                }
                badges {
                  id
                  key
                  icon
                }
              }
              commentsCount
              categories {
                id
                name
                icon
              }
              shoutedCount
            }
          }
        `)
      },
      variables() {
        return {
          filter: this.filter,
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
.post-add-button {
  z-index: 100;
  position: fixed;
  top: 98vh;
  left: 98vw;
  transform: translate(-120%, -120%);
  box-shadow: $box-shadow-x-large;
}
</style>
