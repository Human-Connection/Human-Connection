<template>
  <div>
    <masonry-grid>
      <ds-grid-item v-show="hashtag" :row-span="2" column-span="fullWidth">
        <filter-menu :hashtag="hashtag" @clearSearch="clearSearch" />
      </ds-grid-item>
      <ds-grid-item :row-span="2" column-span="fullWidth" class="top-info-bar">
        <!--<donation-info /> -->
        <div>
          <a target="_blank" href="https://human-connection.org/spenden/">
            <base-button filled>{{ $t('donations.donate-now') }}</base-button>
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
        <masonry-grid-item
          v-for="post in posts"
          :key="post.id"
          :imageAspectRatio="post.image && post.image.aspectRatio"
        >
          <hc-post-card
            :post="post"
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
      <nuxt-link :to="{ name: 'post-create' }">
        <base-button
          v-tooltip="{
            content: $t('contribution.newPost'),
            placement: 'left',
            delay: { show: 500 },
          }"
          class="post-add-button"
          icon="plus"
          filled
          circle
        />
      </nuxt-link>
    </client-only>
    <client-only>
      <infinite-loading v-if="hasMore" @infinite="showMoreContributions" />
    </client-only>
  </div>
</template>

<script>
// import DonationInfo from '~/components/DonationInfo/DonationInfo.vue'
import FilterMenu from '~/components/FilterMenu/FilterMenu.vue'
import HcEmpty from '~/components/Empty/Empty'
import HcPostCard from '~/components/PostCard/PostCard.vue'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid.vue'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem.vue'
import { mapGetters, mapMutations } from 'vuex'
import { filterPosts } from '~/graphql/PostQuery.js'
import PostMutations from '~/graphql/PostMutations'
import UpdateQuery from '~/components/utils/UpdateQuery'

export default {
  components: {
    // DonationInfo,
    FilterMenu,
    HcPostCard,
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
    }),
    selected: {
      get() {
        return this.selectedOrder(this)
      },
      set({ value }) {
        this.offset = 0
        this.posts = []
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
      return this.$apollo.loading || (this.posts && this.posts.length > 0)
    },
  },
  methods: {
    ...mapMutations({
      selectOrder: 'posts/SELECT_ORDER',
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
    showMoreContributions($state) {
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
        updateQuery: UpdateQuery(this, { $state, pageKey: 'Post' }),
      })
    },
    deletePost(deletedPost) {
      this.posts = this.posts.filter(post => {
        return post.id !== deletedPost.id
      })
    },
    resetPostList() {
      this.offset = 0
      this.posts = []
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

.base-button.--circle.post-add-button {
  height: 54px;
  width: 54px;
  font-size: 26px;
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

  @media (max-width: 680px) {
    width: 180px;
  }
}

.top-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  @media (max-width: 546px) {
    grid-row-end: span 3 !important;
    flex-direction: column;
  }
}
</style>
