<template>
  <searchable-input
    data-test="search-field"
    :loading="pending"
    :options="searchResults"
    @query="query"
    @clearSearch="clear"
  />
</template>

<script>
import { findResourcesQuery } from '~/graphql/Search.js'
import SearchableInput from '~/components/generic/SearchableInput/SearchableInput.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'SearchField',
  components: {
    SearchableInput,
  },
  data() {
    return {
      pending: false,
      searchResults: [],
    }
  },
  computed: {
    ...mapGetters({ postsFilter: 'posts/filter' }),
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
            filter: this.postsFilter,
          },
        })
        this.searchResults = findResources
      } catch (error) {
        this.searchResults = []
      } finally {
        this.pending = false
      }
    },
    clear() {
      this.pending = false
      this.searchResults = []
    },
  },
}
</script>
