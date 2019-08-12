<template>
  <div>
    <ds-flex :width="{ base: '100%' }" gutter="base">
      <ds-flex-item>
        <filter-menu :hashtag="hashtag" @clearSearch="clearSearch" />
      </ds-flex-item>
      <ds-flex-item>
        <div class="sorting-dropdown">
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
        v-for="post in posts"
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
    <hc-load-more v-if="hasMore" :loading="$apollo.loading" @click="showMoreContributions" />
  </div>
</template>

<script>
import FilterMenu from '~/components/FilterMenu/FilterMenu.vue'
import uniqBy from 'lodash/uniqBy'
import HcPostCard from '~/components/PostCard'
import HcLoadMore from '~/components/LoadMore.vue'
import { mapGetters } from 'vuex'
import { filterPosts } from '~/graphql/PostQuery.js'

export default {
  components: {
    FilterMenu,
    HcPostCard,
    HcLoadMore,
  },
  data() {
    const { hashtag = null } = this.$route.query
    return {
      posts: [],
      hasMore: true,
      // Initialize your apollo data
      offset: 0,
      pageSize: 12,
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
          label: this.$t('sorting.popular'),
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
  computed: {
    ...mapGetters({
      postsFilter: 'postsFilter/postsFilter',
    }),
    finalFilters() {
      let filter = this.postsFilter
      if (this.hashtag) {
        filter = {
          ...filter,
          tags_some: { name: this.hashtag },
        }
      }
      return filter
    },
  },
  watch: {
    postsFilter() {
      this.offset = 0
      this.posts = []
    },
  },
  methods: {
    toggleOnlySorting(x) {
      this.offset = 0
      this.posts = []
      this.sortingIcon = x.icons
      this.sorting = x.order
    },
    clearSearch() {
      this.$router.push({ path: '/' })
      this.hashtag = null
    },
    href(post) {
      return this.$router.resolve({
        name: 'post-id-slug',
        params: { id: post.id, slug: post.slug },
      }).href
    },
    showMoreContributions() {
      this.offset += this.pageSize
    },
    deletePost(_index, postId) {
      this.posts = this.posts.filter(post => {
        return post.id !== postId
      })
    },
  },
  apollo: {
    Post: {
      query() {
        return filterPosts(this.$i18n)
      },
      variables() {
        const result = {
          filter: this.finalFilters,
          first: this.pageSize,
          offset: this.offset,
          orderBy: this.sorting,
        }
        return result
      },
      update({ Post }) {
        // TODO: find out why `update` gets called twice initially.
        // We have to filter for uniq posts only because we get the same
        // result set twice.
        this.hasMore = Post.length >= this.pageSize
        const posts = uniqBy([...this.posts, ...Post], 'id')
        this.posts = posts
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

.sorting-dropdown {
  width: 250px;
  position: relative;
  float: right;
  padding: 0 18px;
}
</style>
