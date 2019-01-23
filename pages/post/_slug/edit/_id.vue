<template>
  <ds-flex
    :width="{ base: '100%' }"
    gutter="base"
  >
    <ds-flex-item :width="{ base: '100%', sm: 3, md: 5, lg: 3 }">
      <ds-card>
        <no-ssr>
          <hc-editor :html="htmlContent" />
        </no-ssr>
      </ds-card>
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
      &nbsp;
    </ds-flex-item>
  </ds-flex>
</template>

<script>
import gql from 'graphql-tag'
import HcEditor from '~/components/Editor/Editor.vue'

export default {
  components: {
    HcEditor
  },
  computed: {
    htmlContent() {
      return this.Post ? this.Post[0].content : ''
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
