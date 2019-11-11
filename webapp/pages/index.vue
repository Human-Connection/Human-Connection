<template>
  <div>
    <masonry-grid>
      <ds-grid-item v-show="hashtag" :row-span="2" column-span="fullWidth">
        <filter-menu :hashtag="hashtag" @clearSearch="clearSearch" />
      </ds-grid-item>
      <ds-grid-item :row-span="2" column-span="fullWidth" class="top-info-bar">
        <div class="donation-info">
          <div class="progress-bar">
            <h4 class="progress-bar__title">Donations for November</h4>
            <div class="progress-bar__goal" style="width: 100%;"></div>
            <div class="progress-bar__progress" style="width: 18.33%;"></div>
            <span class="progress-bar__label">500 of 15.000 €</span>
          </div>
          <a href="https://human-connection.org/spenden/">
            <ds-button primary>Donate now</ds-button>
          </a>
        </div>
        <div class="sorting-dropdown">
          <ds-select
            v-model="selected"
            :options="sortingOptions"
            size="large"
            :icon-right="sortingIcon"
          ></ds-select>
        </div>
      </ds-grid-item>
      <template v-if="hasResults">
        <masonry-grid-item v-for="post in currentPosts" :key="post.id">
          <hc-post-card
            :post="post"
            :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
            @removePostFromList="deletePost"
            @pinPost="pinPost"
            @unpinPost="unpinPost"
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
import HcPostCard from '~/components/PostCard/PostCard.vue'
import HcLoadMore from '~/components/LoadMore.vue'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid.vue'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem.vue'
import { mapGetters, mapMutations } from 'vuex'
import { filterPosts } from '~/graphql/PostQuery.js'
import PostMutations from '~/graphql/PostMutations'

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
    }
  },
  computed: {
    ...mapGetters({
      postsFilter: 'posts/filter',
      orderOptions: 'posts/orderOptions',
      orderBy: 'posts/orderBy',
      selectedOrder: 'posts/selectedOrder',
      sortingIcon: 'posts/orderIcon',
      currentPosts: 'posts/currentPosts',
    }),
    selected: {
      get() {
        return this.selectedOrder(this)
      },
      set({ value }) {
        this.offset = 0
        this.setCurrentPosts([])
        this.selectOrder(value)
      },
    },
    sortingOptions() {
      return this.orderOptions(this)
    },
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
      return this.$apollo.loading || (this.currentPosts && this.currentPosts.length > 0)
    },
  },
  methods: {
    ...mapMutations({
      selectOrder: 'posts/SELECT_ORDER',
      setCurrentPosts: 'posts/SET_CURRENT_POSTS',
    }),
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
          orderBy: ['pinned_asc', this.orderBy],
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.Post.length < this.pageSize) {
            this.hasMore = false
          }
          const result = {
            ...previousResult,
            Post: [
              ...previousResult.Post.filter(prevPost => {
                return (
                  fetchMoreResult.Post.filter(newPost => newPost.id === prevPost.id).length === 0
                )
              }),
              ...fetchMoreResult.Post,
            ],
          }
          this.setCurrentPosts(result.Post)
        },
      })
    },
    deletePost(deletedPost) {
      const posts = this.currentPosts.filter(post => {
        return post.id !== deletedPost.id
      })
      this.setCurrentPosts(posts)
    },
    resetPostList() {
      this.offset = 0
      this.setCurrentPosts([])
      this.hasMore = true
    },
    pinPost(post) {
      this.$apollo
        .mutate({
          mutation: PostMutations().pinPost,
          variables: { id: post.id },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.pinnedSuccessfully'))
          this.resetPostList()
          this.$apollo.queries.Post.refetch()
        })
        .catch(error => this.$toast.error(error.message))
    },
    unpinPost(post) {
      this.$apollo
        .mutate({
          mutation: PostMutations().unpinPost,
          variables: { id: post.id },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.unpinnedSuccessfully'))
          this.resetPostList()
          this.$apollo.queries.Post.refetch()
        })
        .catch(error => this.$toast.error(error.message))
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
          orderBy: ['pinned_asc', this.orderBy],
          offset: 0,
        }
      },
      update({ Post }) {
        this.setCurrentPosts(Post)
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
}

.top-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.donation-info {
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.progress-bar {
  position: relative;
  height: 100%;
  width: 240px;
  margin-right: $space-x-small;
}

.progress-bar__title {
  position: absolute;
  top: -2px;
  left: $space-xx-small;
  margin: 0;
}

.progress-bar__goal {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 37.5px; // styleguide-button-size
  background-color: $color-neutral-100;
  border-radius: $border-radius-base;
}

.progress-bar__progress {
  position: absolute;
  bottom: 1px;
  left: 0;
  height: 35.5px; // styleguide-button-size
  background-color: $color-yellow;
  border-radius: $border-radius-base;
}

.progress-bar__label {
  position: absolute;
  top: 50%;
  left: $space-xx-small;
}
</style>
