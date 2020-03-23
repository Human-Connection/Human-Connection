<template>
  <div class="search-results">
    <tab-navigation :tabs="tabOptions" :activeTab="activeTab" @switchTab="switchTab" />
    <section>
      <p v-if="!activeResources.length">No results found for "{{ search }}"</p>
      <masonry-grid v-else-if="activeTab === 'Post'">
        <masonry-grid-item v-for="resource in activeResources" :key="resource.key">
          <post-teaser :post="resource" />
        </masonry-grid-item>
      </masonry-grid>
      <ul v-else-if="activeTab === 'User'" class="user-list">
        <li v-for="resource in activeResources" :key="resource.key" class="item">
          <base-card :wideContent="true">
            <user-teaser :user="resource" />
          </base-card>
        </li>
      </ul>
    </section>
  </div>
</template>
<script>
import { searchQuery } from '~/graphql/Search.js'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem'
import TabNavigation from '~/components/_new/generic/TabNavigation/TabNavigation'
import PostTeaser from '~/components/PostTeaser/PostTeaser'
import UserTeaser from '~/components/UserTeaser/UserTeaser'

export default {
  components: {
    MasonryGrid,
    MasonryGridItem,
    TabNavigation,
    PostTeaser,
    UserTeaser,
  },
  props: {
    search: {
      type: String,
    },
  },
  data() {
    return {
      posts: [],
      users: [],
      activeTab: 'Post',
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
          title: `${this.posts.length} Posts`,
          disabled: !this.posts.length,
        },
        {
          type: 'User',
          title: `${this.users.length} Users`,
          disabled: !this.users.length,
        },
      ]
    },
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
  },
  apollo: {
    searchResults: {
      query() {
        return searchQuery
      },
      variables() {
        return {
          query: this.search,
          limit: 37,
        }
      },
      skip() {
        return !this.search
      },
      update({ searchResults }) {
        this.posts = searchResults.filter(result => result.__typename === 'Post')
        this.users = searchResults.filter(result => result.__typename === 'User')
        if (searchResults.length) this.activeTab = searchResults[0].__typename
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
<style lang="scss">
.search-results {
  > section {
    display: inline-block;
    width: 100%;
    max-width: 600px;
    padding: $space-small;
    background-color: $color-neutral-80;
    border-radius: 0 $border-radius-base $border-radius-base $border-radius-base;
  }

  .user-list > .item {
    transition: opacity .1s;

    &:not(:last-child) {
      margin-bottom: $space-small;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
