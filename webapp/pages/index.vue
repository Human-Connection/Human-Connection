<template>
  <div>
    <masonry-grid>
      <ds-grid-item v-show="hashtag" :row-span="2" column-span="fullWidth">
        <filter-menu :hashtag="hashtag" @clearSearch="clearSearch" />
      </ds-grid-item>
      <ds-grid-item :row-span="2" column-span="fullWidth">
        <div class="sorting-dropdown">
          <ds-select
            v-model="selected"
            :options="sortingOptions"
            size="large"
            v-bind:icon-right="sortingIcon"
            @input="toggleOnlySorting"
          ></ds-select>
        </div>
      </ds-grid-item>
      <template v-if="hasResults">
        <masonry-grid-item v-for="post in posts" :key="post.id">
          <hc-post-card
            :post="post"
            :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
            @removePostFromList="deletePost"
          />
        </masonry-grid-item>
      </template>
      <template v-else>
        <ds-grid-item :row-span="2" column-span="fullWidth">
          <hc-empty icon="docs" />
          <ds-text align="center">{{ $t('index.no-results') }}</ds-text>
          <ds-text align="center">{{ $t('index.change-filter-settings') }}</ds-text>
        </ds-grid-item>
      </template>
    </masonry-grid>
    <client-only>
      <ds-button
        v-tooltip="{ content: $t('contribution.newPost'), placement: 'left', delay: { show: 500 } }"
        :path="{ name: 'post-create' }"
        class="post-add-button"
        icon="plus"
        size="x-large"
        primary
      />
    </client-only>
    <div
      v-if="hasMore"
      v-infinite-scroll="showMoreContributions"
      :infinite-scroll-disabled="$apollo.loading"
      :infinite-scroll-distance="10"
      :infinite-scroll-throttle-delay="800"
      :infinite-scroll-immediate-check="true"
    >
      <hc-load-more :loading="$apollo.loading" @click="showMoreContributions" />
    </div>
  </div>
</template>

<script>
import FilterMenu from '~/components/FilterMenu/FilterMenu.vue'
import HcEmpty from '~/components/Empty'
import HcPostCard from '~/components/PostCard'
import HcLoadMore from '~/components/LoadMore.vue'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid.vue'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem.vue'
import { mapGetters } from 'vuex'
import { filterPosts } from '~/graphql/PostQuery.js'

export default {
  components: {
    FilterMenu,
    HcPostCard,
    HcLoadMore,
    HcEmpty,
    MasonryGrid,
    MasonryGridItem,
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
          tags_some: { id: this.hashtag },
        }
      }
      return filter
    },
    hasResults() {
      return this.$apollo.loading || (this.posts && this.posts.length > 0)
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
      const { Post: PostQuery } = this.$apollo.queries
      if (!PostQuery) return // seems this can be undefined on subpages

      this.offset += this.pageSize
      PostQuery.fetchMore({
        variables: {
          offset: this.offset,
          filter: this.finalFilters,
          first: this.pageSize,
          orderBy: this.sorting,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.Post.length < this.pageSize) {
            this.hasMore = false
          }
          const result = Object.assign({}, previousResult, {
            Post: [...previousResult.Post, ...fetchMoreResult.Post],
          })
          return result
        },
      })
    },
    deletePost(deletedPost) {
      this.posts = this.posts.filter(post => {
        return post.id !== deletedPost.id
      })
    },
  },
  apollo: {
    Post: {
      query() {
        return filterPosts(this.$i18n)
      },
      variables() {
        return {
          filter: this.finalFilters,
          first: this.pageSize,
          orderBy: this.sorting,
          offset: 0,
        }
      },
      update({ Post }) {
        this.posts = Post
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.ds-card-image img {
  max-height: 2000px;
  object-fit: contain;
}

.masonry-grid {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 20px;
}

.grid-item {
  grid-row-end: span 2;

  &--full-width {
    grid-column: 1 / -1;
  }
}

.post-add-button {
  z-index: 100;
  position: fixed;
  bottom: -5px;
  left: 98vw;
  transform: translate(-120%, -120%);
  box-shadow: $box-shadow-x-large;
}

.sorting-dropdown {
  width: 250px;
  position: relative;
  float: right;
  margin: 4px 0;
}
</style>
