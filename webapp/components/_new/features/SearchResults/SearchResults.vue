<template>
  <div class="search-results">
    <tab-navigation :tabs="tabOptions" :activeTab="activeTab" @switchTab="switchTab" />
    <section v-if="activeResources.length">
      <masonry-grid v-if="activeTab === 'posts'">
        <masonry-grid-item v-for="resource in activeResources" :key="resource.key">
          <post-teaser :post="resource" />
        </masonry-grid-item>
      </masonry-grid>
      <ul v-else-if="activeTab === 'users'">
        <li v-for="resource in activeResources" :key="resource.key" class="list">
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
      searchResults: [],
      activeTab: 'posts',
    }
  },
  computed: {
    posts() {
      return this.searchResults.filter(result => result.__typename === 'Post')
    },
    users() {
      return this.searchResults.filter(result => result.__typename === 'User')
    },
    activeResources() {
      if (this.activeTab === 'posts') return this.posts
      else if (this.activeTab === 'users') return this.users
      else return []
    },
    tabOptions() {
      return [
        { type: 'posts', title: `${this.posts.length} Posts` },
        { type: 'users', title: `${this.users.length} Users` },
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
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
<style lang="scss">
.search-results {
  // width: 40%;

  > section {
    padding: $space-small;
    background-color: $color-neutral-80;
    border-radius: 0 $border-radius-base $border-radius-base $border-radius-base;
  }
}
.search-results .list {
  margin: $space-xxx-small 0 $space-small 0;
}
</style>
