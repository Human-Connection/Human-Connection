<template>
  <div class="search-results">

    <tab-navigation
      :tabs="tabOptions"
      @openTab="switchTab"
    />
    <section>
      <ul v-if="activeResources.length">
        <li v-for="resource in activeResources" :key="resource.key">
          <post-teaser v-if="activeTab === 'posts'" :post="resource" />
          <base-card v-else-if="activeTab === 'users'" :wideContent="true">
            <user-teaser :user="resource" />
          </base-card>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { findResourcesQuery } from '~/graphql/Search.js'
import FilterMenu from '~/components/FilterMenu/FilterMenu'
import TabNavigation from '~/components/_new/generic/TabNavigation/TabNavigation'
import PostTeaser from '~/components/PostTeaser/PostTeaser'
import UserTeaser from '~/components/UserTeaser/UserTeaser'

export default {
  layout: 'default',
  head() {
    return {
      title: 'SearchResults',
    }
  },
  components: {
    FilterMenu,
    TabNavigation,
    PostTeaser,
    UserTeaser,
  },
  data() {
    const { item = null } = this.$route.query
    console.log('data', item)
    return {
      loading: true,
      value: '',
      pending: false,
      findResources: [],
      activeTab : 'posts',
      item,
    }
  },
  computed: {
    posts() {
      return this.findResources.filter(result => result.__typename === 'Post')
    },
    users() {
      return this.findResources.filter(result => result.__typename === 'User')
    },
    activeResources() {
      if (this.activeTab === 'posts') return this.posts
      else if (this.activeTab === 'users') return this.users
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
    }
  },
  apollo: {
    findResources: {
      query() {
        return findResourcesQuery
      },
      variables() {
        return {
          query: this.item,
          limit: 37
        }
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
