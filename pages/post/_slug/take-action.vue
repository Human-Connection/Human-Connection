<template>
  <ds-card header="Werde aktiv!">
    <p>Was kann ich tun? Hier findest du mögliche Projekte, Aktioner, etc.</p>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },

  data() {
    return {
      Post: []
    }
  },
  computed: {
    tags() {
      return this.Post ? this.Post[0].tags.map(tag => tag.name) : '-'
    }
  },
  apollo: {
    Post: {
      query: gql(`
        query {
          Post {
            id
            title
            tags {
              name
            }
            categories {
              name
            }
            shoutedCount
            shoutedBy {
              name
              friends {
                name
              }
            }
          }
        }
      `)
    }
  }
}
</script>
