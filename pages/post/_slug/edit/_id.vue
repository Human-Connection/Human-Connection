<template>
  <ds-flex
    :width="{ base: '100%' }"
    gutter="base"
  >
    <ds-flex-item :width="{ base: '100%' }">
      <hc-contribution-form :contribution="contribution" />
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
      &nbsp;
    </ds-flex-item>
  </ds-flex>
</template>

<script>
import gql from 'graphql-tag'
import HcContributionForm from '~/components/ContributionForm.vue'

export default {
  components: {
    HcContributionForm
  },
  computed: {
    contribution() {
      if (!this.Post || !this.Post[0].id) {
        return
      }
      return this.Post[0]
    }
  },
  apollo: {
    Post: {
      query() {
        return gql(`
          query($id: ID!) {
            Post(id: $id) {
              id
              title
              content
              createdAt
              slug
              image
              tags {
                name
              }
              categories {
                id
                name
                icon
              }
            }
          }
        `)
      },
      variables() {
        return {
          id: this.$route.params.id || 'p1'
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
