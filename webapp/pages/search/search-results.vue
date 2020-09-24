<template>
  <search-results :search="search" />
</template>

<script>
import SearchResults from '~/components/_new/features/SearchResults/SearchResults'

export default {
  layout: 'default',
  watchQuery: ['search'],
  head() {
    return {
      title: this.$t('search.title'),
    }
  },
  components: {
    SearchResults,
  },
  asyncData(context) {
    const { search = null } = context.query
    return { search }
  },
}
</script>
