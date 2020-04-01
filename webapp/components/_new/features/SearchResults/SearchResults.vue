<template>
  <div class="search-results">
    <tab-navigation :tabs="tabOptions" :activeTab="activeTab" @switchTab="switchTab" />
    <section
      :class="['results', activeTab === 'User' && '--user', !activeResources.length && '--empty']"
    >
      <hc-empty
        v-if="!activeResources.length"
        icon="tasks"
        :message="$t('search.no-results', { search })"
      />
      <template v-else-if="activeTab === 'Post'">
        <masonry-grid>
          <masonry-grid-item v-for="resource in activeResources" :key="resource.key">
            <post-teaser :post="resource" />
          </masonry-grid-item>
        </masonry-grid>
        <pagination-buttons
          :hasNext="hasMorePosts"
          :hasPrevious="hasPreviousPosts"
          @back="previousPosts"
          @next="nextPosts"
        />
      </template>
      <ul v-else-if="activeTab === 'User'" class="user-list">
        <li v-for="resource in activeResources" :key="resource.key" class="item">
          <base-card :wideContent="true">
            <user-teaser :user="resource" />
          </base-card>
        </li>
        <pagination-buttons
          :hasNext="hasMoreUsers"
          :hasPrevious="hasPreviousUsers"
          @back="previousUsers"
          @next="nextUsers"
        />
      </ul>
    </section>
  </div>
</template>

<script>
import { searchPosts, searchUsers } from '~/graphql/Search.js'
import HcEmpty from '~/components/Empty/Empty'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem'
import PostTeaser from '~/components/PostTeaser/PostTeaser'
import TabNavigation from '~/components/_new/generic/TabNavigation/TabNavigation'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import PaginationButtons from '~/components/_new/generic/PaginationButtons/PaginationButtons'

export default {
  components: {
    TabNavigation,
    HcEmpty,
    MasonryGrid,
    MasonryGridItem,
    PostTeaser,
    PaginationButtons,
    UserTeaser,
  },
  props: {
    search: {
      type: String,
    },
  },
  data() {
    const pageSize = 25
    return {
      posts: [],
      users: [],
      activeTab: null,
      pageSize,
      firstPosts: pageSize,
      firstUsers: pageSize,
      postsOffset: 0,
      usersOffset: 0,
      hasMorePosts: false,
      hasMoreUsers: false,
    }
  },
  computed: {
    activeResources() {
      if (this.activeTab === 'Post') return this.posts
      else if (this.activeTab === 'User') return this.users
      else return []
    },
    tabOptions() {
      return [
        {
          type: 'Post',
          title: `${this.posts.length} ${this.$t('search.heading.Post')}`,
          disabled: !this.posts.length,
        },
        {
          type: 'User',
          title: `${this.users.length} ${this.$t('search.heading.User')}`,
          disabled: !this.users.length,
        },
      ]
    },
    hasPreviousPosts() {
      return this.postsOffset > 0
    },
    hasPreviousUsers() {
      return this.usersOffset > 0
    },
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
    previousPosts() {
      this.postsOffset = Math.max(this.postsOffset - this.pageSize, 0)
    },
    nextPosts() {
      this.postsOffset += this.pageSize
    },
    previousUsers() {
      this.usersOffset = Math.max(this.usersOffset - this.pageSize, 0)
    },
    nextUsers() {
      this.usersOffset += this.pageSize
    },
  },
  apollo: {
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
        this.posts = searchPosts
        this.hasMorePosts = this.posts.length >= this.pageSize
        if (searchPosts.length) this.activeTab = 'Post'
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
        this.users = searchUsers
        this.hasMoreUsers = this.users.length >= this.pageSize
        if (!searchPosts.length && searchUsers.length) this.activeTab = 'User'
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.search-results {
  > .results {
    display: inline-block;
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
</style>
