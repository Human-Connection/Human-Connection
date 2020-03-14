<template>
  <ds-container>
    <div>
      <ds-flex>
        <ds-flex-item>
          <ds-placeholder>
            <ds-button @click="closeSearch" size="x-large" icon="close" right>close</ds-button>
          </ds-placeholder>
        </ds-flex-item>
        <ds-flex-item width="2">
          <ds-placeholder>
            <ds-tag color="primary" size="x-large" round>{{ searchResults.length }}</ds-tag>
            Results for:
            <b>{{ value }}</b>
          </ds-placeholder>
        </ds-flex-item>
        <ds-flex-item width="3">
          <ds-placeholder>
            <ds-button
              @click="postOnly = !postOnly"
              :secondary="postOnly"
              size="x-large"
              icon="pencil"
              align="right"
            >
              Beiträge
            </ds-button>
            <ds-button
              @click="userOnly = !userOnly"
              :secondary="userOnly"
              size="x-large"
              icon="user"
              align="right"
            >
              User
            </ds-button>
          </ds-placeholder>
        </ds-flex-item>
      </ds-flex>
    </div>
    <ds-space />
    <ds-space
      v-for="(searchResults, index) in searchResults"
      :key="searchResults.key"
      v-bind:class="{
        isUser: searchResults.__typename === 'User',
        isPost: searchResults.__typename === 'Post',
      }"
    >
      <div v-if="searchResults.__typename === 'User'" v-show="userOnly">
        <b>{{ index + 1 }}</b>
        -
        <b>{{ searchResults.__typename }}</b>
        - {{ searchResults }}
      </div>
      <div v-if="searchResults.__typename === 'Post'" v-show="postOnly">
        <b>{{ index + 1 }}</b>
        -
        <b>{{ searchResults.__typename }}</b>
        - {{ searchResults }}
      </div>
    </ds-space>
  </ds-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { findResourcesQuery } from '~/graphql/Search.js'

export default {
  layout: 'default',
  head() {
    return {
      title: 'SearchResults',
    }
  },
  data() {
    return {
      loading: true,
      request: '',
      value: '',
      selected: '',
      pending: false,
      searchResults: [],
      userOnly: true,
      postOnly: true,
    }
  },

  computed: {
    ...mapGetters({
      searchValue: 'search/searchValue',
      orderOptions: 'posts/orderOptions',
      sortingIcon: 'posts/orderIcon',
    }),
    sortingOptions() {
      return this.orderOptions(this)
    },
  },
  mounted() {
    this.value = this.$route.query.item
    this.query(this.value)
  },

  watch: {
    searchValue: function(val) {
      this.value = val
      this.query(this.value)
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
          },
        })
        this.searchResults = findResources
      } catch (error) {
        this.searchResults = []
      } finally {
        this.pending = false
      }
    },
    closeSearch() {
      this.$router.replace('/')
    },
  },
}
</script>

<style lang="scss"></style>
