<template>
  <div>
    <ds-flex
      v-if="Post && Post.length"
      :width="{ base: '100%' }"
      gutter="base"
    >
      <ds-flex-item
        v-for="post in uniq(Post)"
        :key="post.id"
        :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
      >
        <hc-post-card :post="post" />
      </ds-flex-item>
    </ds-flex>
    <no-ssr>
      <ds-button
        v-tooltip="{content: 'Create a new Post', placement: 'left', delay: { show: 500 }}"
        class="post-add-button"
        icon="plus"
        size="x-large"
        primary
        @click="$router.push('/post/create')"
      />
    </no-ssr>
    <hc-load-more
      v-if="true"
      :loading="$apollo.loading"
      @click="showMoreContributions"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import uniqBy from 'lodash/uniqBy'
import HcPostCard from '~/components/PostCard.vue'
import HcLoadMore from '~/components/LoadMore.vue'

export default {
  components: {
    HcPostCard,
    HcLoadMore
  },
  data() {
    return {
      // Initialize your apollo data
      Post: [],
      page: 1,
      pageSize: 10
    }
  },
  computed: {
    tags() {
      return this.Post ? this.Post[0].tags.map(tag => tag.name) : '-'
    },
    offset() {
      return (this.page - 1) * this.pageSize
    }
  },
  methods: {
    uniq(items, field = 'id') {
      return uniqBy(items, field)
    },
    href(post) {
      return this.$router.resolve({
        name: 'post-slug',
        params: { slug: post.slug }
      }).href
    },
    showMoreContributions() {
      // this.page++
      // Fetch more data and transform the original result
      this.page++
      this.$apollo.queries.Post.fetchMore({
        variables: {
          first: this.pageSize,
          offset: this.offset
        },
        // Transform the previous result with new data
        updateQuery: (previousResult, { fetchMoreResult }) => {
          let output = { Post: this.Post }
          output.Post = [...previousResult.Post, ...fetchMoreResult.Post]
          return output
        },
        fetchPolicy: 'cache-and-network'
      })
    }
  },
  apollo: {
    Post: {
      query() {
        return gql(`
          query Post($first: Int, $offset: Int) {
            Post(first: $first, offset: $offset, orderBy: createdAt_desc) {
              id
              title
              contentExcerpt
              createdAt
              slug
              image
              author {
                id
                avatar
                slug
                name
                contributionsCount
                shoutedCount
                commentsCount
                followedByCount
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
          first: this.pageSize,
          offset: 0
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>

<style lang="scss">
.post-add-button {
  z-index: 100;
  position: fixed;
  top: 100vh;
  left: 100vw;
  transform: translate(-120%, -120%);
  box-shadow: $box-shadow-x-large;
}
</style>
