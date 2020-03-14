<template>
  <ds-container>
    <ds-text align="right">
      <ds-button size="x-large" icon="close" right>close</ds-button>
    </ds-text>

    <ds-text size="x-large">
      <ds-space>
        <ds-tag color="primary" size="x-large" round>{{ searchResults.length }}</ds-tag>
        Results for:
        <b>{{ value }}</b>
      </ds-space>
    </ds-text>
    <div>
      <ds-button size="x-large" icon="pencil" align="right">Beiträge</ds-button>
      <ds-button size="x-large" icon="user" align="right">User</ds-button>
    </div>
    <ds-space>
      {{ searchResults }}
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
  },
}
</script>

<style lang="scss"></style>
