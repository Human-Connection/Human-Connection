<template>
  <div class="search-results">
    <filter-menu :hashtag="value" @clearSearch="closeSearch" />
    <tab-navigation
      :tabs="tabOptions"
      @openTab="value => showActive = value"
    />
    <section>
      <ul v-if="activeResources.length">
        <li v-for="resource in activeResources" :key="resource.key">
          <post-teaser v-if="showActive === 'posts'" :post="resource" />
          <base-card v-else-if="showActive === 'users'" :wideContent="true">
            <user-teaser :user="resource" />
          </base-card>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
    return {
      loading: true,
      value: '',
      pending: false,
      searchResults: [],
      showActive: 'posts',
    }
  },
  computed: {
    ...mapGetters({
      searchValue: 'search/searchValue',
    }),
    posts() {
      return this.searchResults.filter(result => result.__typename === 'Post')
    },
    users() {
      return this.searchResults.filter(result => result.__typename === 'User')
    },
    activeResources() {
      if (this.showActive === 'posts') return this.posts
      else if (this.showActive === 'users') return this.users
    },
    tabOptions() {
      return [
        { type: 'posts', title: `${this.posts.length} Posts` },
        { type: 'users', title: `${this.users.length} Users` },
      ]
    },
  },
  mounted() {
    if (this.$route.query.item){
    this.value = this.$route.query.item
    this.query(this.value)
    } else {
      this.$router.push('/')
    }
  },
  watch: {
    searchValue(value) {
      this.query(value)
    },
  },
  methods: {
    async query(value) {
      this.pending = true
      try {
        const {
          data: { findResources },
        } = await this.$apollo.query({
          query: findResourcesQuery,
          variables: {
            query: value,
            limit: 37,
          },
        })
        // console.log('users', this.users)
        // console.log('posts', this.posts)
        console.log("findResources",findResources)
        this.searchResults = findResources
      } catch (error) {
        this.searchResults = []
      } finally {
        this.pending = false
      }
    },
    closeSearch() {
      this.$router.push('/')
    },
  },
}
</script>
