<template>
  <div>
    <ds-flex :width="{ base: '100%' }" gutter="base">
      <ds-flex-item>
        <filter-menu
          :user="currentUser"
          @changeFilterBubble="changeFilterBubble"
          :hashtag="hashtag"
          @clearSearch="clearSearch"
        />
      </ds-flex-item>
      <ds-flex-item>
        <div style="width: 250px; position: relative; float: right; padding: 0 18px;">
          <ds-select
            v-model="selected"
            :options="sortingOptions"
            size="large"
            v-bind:icon-right="sortingIcon"
            @input="toggleOnlySorting"
          ></ds-select>
        </div>
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
import { mapGetters } from 'vuex'
import HcPostCard from '~/components/PostCard'
import HcLoadMore from '~/components/LoadMore.vue'
import { sortPosts } from '~/graphql/PostQuery.js'

export default {
  components: {
    FilterMenu,
    HcPostCard,
    HcLoadMore,
  },
  data() {
    const { hashtag = null } = this.$route.query
    return {
      // Initialize your apollo data
      Post: [],
      page: 1,
      pageSize: 12,
      filter: {},
      hashtag,
      placeholder: this.$t('sorting.newest'),
      selected: this.$t('sorting.newest'),
      sortingIcon: 'sort-amount-desc',
      sorting: 'createdAt_desc',
      sortingOptions: [
        {
          label: this.$t('sorting.newest'),
          value: 'Newest',
          icons: 'sort-amount-desc',
          order: 'createdAt_desc',
        },
        {
          label: this.$t('sorting.oldest'),
          value: 'Oldest',
          icons: 'sort-amount-asc',
          order: 'createdAt_asc',
        },
        {
          label: this.$t('sorting.poular'),
          value: 'Popular',
          icons: 'fire',
          order: 'shoutedCount_desc',
        },
        {
          label: this.$t('sorting.commented'),
          value: 'Commented',
          icons: 'comment',
          order: 'commentsCount_desc',
        },
      ],
    }
  },
  mounted() {
    if (this.hashtag) {
      this.changeFilterBubble({ tags_some: { name: this.hashtag } })
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
      if (this.hashtag) {
        filter = {
          ...filter,
          tags_some: { name: this.hashtag },
        }
      }
      this.filter = filter
      this.$apollo.queries.Post.refresh()
    },
    toggleOnlySorting(x) {
      this.sortingIcon = x.icons
      this.sorting = x.order
      this.$apollo.queries.Post.refetch()
    },
    clearSearch() {
      this.$router.push({ path: '/' })
      this.hashtag = null
      delete this.filter.tags_some
      this.changeFilterBubble(this.filter)
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
          query Post($filter: _PostFilter, $first: Int, $offset: Int, $orderBy: [_PostOrdering]) {
            Post(filter: $filter, first: $first, offset: $offset, orderBy: $orderBy) {
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
          orderBy: this.sorting,
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
