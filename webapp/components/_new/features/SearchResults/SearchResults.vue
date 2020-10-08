<template>
  <div id="search-results" class="search-results">
    <ds-flex-item :width="{ base: '100%', sm: 3, md: 5, lg: 3 }">
      <masonry-grid>
        <!-- search text -->
        <ds-grid-item class="grid-total-search-results" :row-span="1" column-span="fullWidth">
          <ds-space margin-bottom="xxx-small" margin-top="xxx-small" centered>
            <ds-text class="total-search-results">
              {{ $t('search.for') }}
              <strong>{{ '"' + (search || '') + '"' }}</strong>
            </ds-text>
          </ds-space>
        </ds-grid-item>

        <!-- tabs -->
        <new-tab-navigation :tabs="tabOptions" :activeTab="activeTab" @switch-tab="switchTab" />

        <!-- search results -->

        <template v-if="!(!activeResourceCount || searchCount === 0)">
          <!-- pagination buttons -->
          <ds-grid-item v-if="activeResourceCount > pageSize" :row-span="2" column-span="fullWidth">
            <ds-space centered>
              <pagination-buttons
                :hasNext="hasNext"
                :showPageCounter="true"
                :hasPrevious="hasPrevious"
                :activePage="activePage"
                :activeResourceCount="activeResourceCount"
                :key="'Top'"
                :pageSize="pageSize"
                @back="previousResults"
                @next="nextResults"
              />
            </ds-space>
          </ds-grid-item>

          <!-- posts -->
          <template v-if="activeTab === 'Post'">
            <masonry-grid-item
              v-for="post in activeResources"
              :key="post.id"
              :imageAspectRatio="post.image && post.image.aspectRatio"
            >
              <post-teaser
                :post="post"
                :width="{ base: '100%', md: '100%', xl: '50%' }"
                @removePostFromList="posts = removePostFromList(post, posts)"
                @pinPost="pinPost(post, refetchPostList)"
                @unpinPost="unpinPost(post, refetchPostList)"
              />
            </masonry-grid-item>
          </template>
          <!-- users -->
          <template v-if="activeTab === 'User'">
            <ds-grid-item v-for="user in activeResources" :key="user.id" :row-span="2">
              <base-card :wideContent="true">
                <user-teaser :user="user" />
              </base-card>
            </ds-grid-item>
          </template>
          <!-- hashtags -->
          <template v-if="activeTab === 'Hashtag'">
            <ds-grid-item v-for="hashtag in activeResources" :key="hashtag.id" :row-span="2">
              <base-card :wideContent="true">
                <hc-hashtag :id="hashtag.id" />
              </base-card>
            </ds-grid-item>
          </template>

          <!-- pagination buttons -->
          <ds-grid-item v-if="activeResourceCount > pageSize" :row-span="2" column-span="fullWidth">
            <ds-space centered>
              <pagination-buttons
                :hasNext="hasNext"
                :hasPrevious="hasPrevious"
                :activePage="activePage"
                :showPageCounter="true"
                :activeResourceCount="activeResourceCount"
                :key="'Bottom'"
                :pageSize="pageSize"
                :srollTo="'#search-results'"
                @back="previousResults"
                @next="nextResults"
              />
            </ds-space>
          </ds-grid-item>
        </template>
        <!-- Wolle <template v-else-if="$apollo.loading">
          <ds-grid-item column-span="fullWidth">
            <ds-space centered>
              <ds-spinner size="base"></ds-spinner>
            </ds-space>
          </ds-grid-item>
        </template> -->
        <!-- Wolle double! -->
        <!-- Wolle <template v-else>
          <ds-grid-item column-span="fullWidth">
            <hc-empty margin="xx-large" icon="file" />
          </ds-grid-item>
        </template> -->
        <!-- no results -->
        <ds-grid-item v-else :row-span="7" column-span="fullWidth">
          <ds-space centered>
            <hc-empty icon="tasks" :message="$t('search.no-results', { search })" />
          </ds-space>
        </ds-grid-item>
      </masonry-grid>
    </ds-flex-item>

    <!-- Wolle old -->
    <!-- <tab-navigation :tabs="tabOptions" :activeTab="activeTab" @switch-tab="switchTab" />
    <section
      :class="['results', activeTab === 'User' && '--user', !activeResourceCount > 0 && '--empty']"
    >
      <hc-empty
        v-if="!activeResourceCount || searchCount === 0"
        icon="tasks"
        :message="$t('search.no-results', { search })"
      />
      <template>
        <pagination-buttons
          v-if="activeResourceCount > pageSize"
          :hasNext="hasNext"
          :showPageCounter="true"
          :hasPrevious="hasPrevious"
          :activePage="activePage"
          :activeResourceCount="activeResourceCount"
          :key="'Top'"
          :pageSize="pageSize"
          @back="previousResults"
          @next="nextResults"
        />
        <masonry-grid v-if="activeTab === 'Post'">
          <masonry-grid-item v-for="resource in activeResources" :key="resource.key">
            <post-teaser :post="resource" />
          </masonry-grid-item>
        </masonry-grid>

        <ul v-if="activeTab === 'User'" class="user-list">
          <li v-for="resource in activeResources" :key="resource.key" class="item">
            <base-card :wideContent="true">
              <user-teaser :user="resource" />
            </base-card>
          </li>
        </ul>

        <ul v-if="activeTab === 'Hashtag'" class="hashtag-list">
          <li v-for="resource in activeResources" :key="resource.key" class="item">
            <base-card :wideContent="true">
              <hc-hashtag :id="resource.id" />
            </base-card>
          </li>
        </ul>

        <pagination-buttons
          v-if="activeResourceCount > pageSize"
          :hasNext="hasNext"
          :hasPrevious="hasPrevious"
          :activePage="activePage"
          :showPageCounter="true"
          :activeResourceCount="activeResourceCount"
          :key="'Bottom'"
          :pageSize="pageSize"
          :srollTo="'#search-results'"
          @back="previousResults"
          @next="nextResults"
        />
      </template>
    </section> -->
  </div>
</template>

<script>
import postListActions from '~/mixins/postListActions'
import { searchPosts, searchUsers, searchHashtags } from '~/graphql/Search.js'
import HcEmpty from '~/components/Empty/Empty'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem'
import PostTeaser from '~/components/PostTeaser/PostTeaser'
// Wolle import TabNavigation from '~/components/_new/generic/TabNavigation/TabNavigation'
import NewTabNavigation from '~/components/_new/generic/TabNavigation/NewTabNavigation'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import PaginationButtons from '~/components/_new/generic/PaginationButtons/PaginationButtons'
import HcHashtag from '~/components/Hashtag/Hashtag'

export default {
  components: {
    // Wolle TabNavigation,
    NewTabNavigation,
    HcEmpty,
    MasonryGrid,
    MasonryGridItem,
    PostTeaser,
    PaginationButtons,
    UserTeaser,
    HcHashtag,
  },
  mixins: [postListActions],
  props: {
    search: {
      type: String,
    },
    pageSize: {
      type: Number,
      default: 12,
    },
  },
  data() {
    return {
      posts: [],
      users: [],
      hashtags: [],

      postCount: 0,
      userCount: 0,
      hashtagCount: 0,

      postPage: 0,
      userPage: 0,
      hashtagPage: 0,

      activeTab: null,

      firstPosts: this.pageSize,
      firstUsers: this.pageSize,
      firstHashtags: this.pageSize,

      postsOffset: 0,
      usersOffset: 0,
      hashtagsOffset: 0,
    }
  },
  computed: {
    activeResources() {
      if (this.activeTab === 'Post') return this.posts
      if (this.activeTab === 'User') return this.users
      if (this.activeTab === 'Hashtag') return this.hashtags
      return []
    },
    activeResourceCount() {
      if (this.activeTab === 'Post') return this.postCount
      if (this.activeTab === 'User') return this.userCount
      if (this.activeTab === 'Hashtag') return this.hashtagCount
      return 0
    },
    activePage() {
      if (this.activeTab === 'Post') return this.postPage
      if (this.activeTab === 'User') return this.userPage
      if (this.activeTab === 'Hashtag') return this.hashtagPage
      return 0
    },
    tabOptions() {
      return [
        {
          type: 'Post',
          title: this.$t('search.heading.Post', {}, this.postCount),
          count: this.postCount,
          disabled: this.postCount === 0,
        },
        {
          type: 'User',
          title: this.$t('search.heading.User', {}, this.userCount),
          count: this.userCount,
          disabled: this.userCount === 0,
        },
        {
          type: 'Hashtag',
          title: this.$t('search.heading.Tag', {}, this.hashtagCount),
          count: this.hashtagCount,
          disabled: this.hashtagCount === 0,
        },
      ]
    },
    hasPrevious() {
      if (this.activeTab === 'Post') return this.postsOffset > 0
      if (this.activeTab === 'User') return this.usersOffset > 0
      if (this.activeTab === 'Hashtag') return this.hashtagsOffset > 0
      return false
    },
    hasNext() {
      if (this.activeTab === 'Post') return (this.postPage + 1) * this.pageSize < this.postCount
      if (this.activeTab === 'User') return (this.userPage + 1) * this.pageSize < this.userCount
      if (this.activeTab === 'Hashtag')
        return (this.hashtagPage + 1) * this.pageSize < this.hashtagCount
      return false
    },
    searchCount() {
      return this.postCount + this.userCount + this.hashtagCount
    },
  },
  methods: {
    clearPage() {
      this.postPage = 0
      this.userPage = 0
      this.hashtagPage = 0
    },
    switchTab(tab) {
      if (this.activeTab !== tab) {
        this.activeTab = tab
      }
    },
    previousResults() {
      switch (this.activeTab) {
        case 'Post':
          this.postPage--
          this.postsOffset = this.postPage * this.pageSize
          break
        case 'User':
          this.userPage--
          this.usersOffset = this.userPage * this.pageSize
          break
        case 'Hashtag':
          this.hashtagPage--
          this.hashtagsOffset = this.hashtagPage * this.pageSize
          break
      }
    },
    nextResults() {
      // scroll to top??
      switch (this.activeTab) {
        case 'Post':
          this.postPage++
          this.postsOffset += this.pageSize
          break
        case 'User':
          this.userPage++
          this.usersOffset += this.pageSize
          break
        case 'Hashtag':
          this.hashtagPage++
          this.hashtagsOffset += this.pageSize
          break
      }
    },
    refetchPostList() {
      this.$apollo.queries.searchPosts.refetch()
    },
  },
  apollo: {
    searchHashtags: {
      query() {
        return searchHashtags
      },
      variables() {
        const { firstHashtags, hashtagsOffset, search } = this
        return {
          query: search,
          firstHashtags,
          hashtagsOffset,
        }
      },
      skip() {
        return !this.search
      },
      update({ searchHashtags }) {
        this.hashtags = searchHashtags.hashtags
        this.hashtagCount = searchHashtags.hashtagCount
        if (this.postCount === 0 && this.userCount === 0 && this.hashtagCount > 0)
          this.activeTab = 'Hashtag'
      },
      fetchPolicy: 'cache-and-network',
    },
    searchUsers: {
      query() {
        return searchUsers
      },
      variables() {
        const { firstUsers, usersOffset, search } = this
        return {
          query: search,
          firstUsers,
          usersOffset,
        }
      },
      skip() {
        return !this.search
      },
      update({ searchUsers }) {
        this.users = searchUsers.users
        this.userCount = searchUsers.userCount
        if (this.postCount === 0 && this.userCount > 0) this.activeTab = 'User'
      },
      fetchPolicy: 'cache-and-network',
    },
    searchPosts: {
      query() {
        return searchPosts
      },
      variables() {
        const { firstPosts, postsOffset, search } = this
        return {
          query: search,
          firstPosts,
          postsOffset,
        }
      },
      skip() {
        return !this.search
      },
      update({ searchPosts }) {
        this.posts = searchPosts.posts
        this.postCount = searchPosts.postCount
        if (this.postCount > 0) this.activeTab = 'Post'
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
// Wolle check if still needed 👇🏼
.search-results {
  > .results {
    /* display: inline-block;*/
    padding: $space-small;
    background-color: $color-neutral-80;
    border-radius: 0 $border-radius-base $border-radius-base $border-radius-base;

    &.--user {
      width: 100%;
      max-width: 600px;
    }

    &.--empty {
      width: 100%;
      max-width: 600px;
      background-color: transparent;
      border: $border-size-base solid $color-neutral-80;
    }
  }

  .user-list > .item {
    transition: opacity 0.1s;

    &:not(:last-child) {
      margin-bottom: $space-small;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}

// Wolle new
.grid-total-search-results {
  padding: 0;
  margin: 0;
  // margin-bottom: $space-x-small;

  // > .base-button {
  //   display: block;
  //   width: 100%;
  //   margin-bottom: $space-x-small;
  // }
}
</style>
