<template>
  <ds-card space="small">
    <ds-heading tag="h3">Tags</ds-heading>
    <ds-table
      :data="Tag"
      :fields="fields"
      condensed>
      <template
        slot="id"
        slot-scope="scope">
        {{ scope.index + 1 }}
      </template>
    </ds-table>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      Tag: [],
      fields: {
        id: { label: '#' },
        name: { label: 'Name' },
        taggedCountUnique: { label: 'Nutzer' },
        taggedCount: { label: 'Beiträge' }
      }
    }
  },
  apollo: {
    Tag: {
      query: gql(`
        query {
          Tag(first: 20, orderBy: taggedCountUnique_desc) {
            id
            name
            taggedCount
            taggedCountUnique
          }
        }
      `)
    }
  }
}
</script>
