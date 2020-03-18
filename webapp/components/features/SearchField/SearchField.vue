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
import { searchQuery } from '~/graphql/Search.js'
import SearchableInput from '~/components/generic/SearchableInput/SearchableInput.vue'

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
  methods: {
    async query(value) {
      this.pending = true
      try {
        const {
          data: { searchResults },
        } = await this.$apollo.query({
          query: searchQuery,
          variables: {
            query: value,
          },
        })
        this.searchResults = searchResults
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
