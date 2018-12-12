<template>
  <ds-card space="small">
    <ds-heading tag="h3">
      Themen / Kategorien
    </ds-heading>
    <ds-table
      :data="Category"
      :fields="['icon', 'name', 'postCount']"
      condensed
    >
      <template
        slot="icon"
        slot-scope="scope"
      >
        <ds-icon :name="scope.row.icon" />
      </template>
    </ds-table>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      Category: []
    }
  },
  apollo: {
    Category: {
      query: gql(`
        query {
          Category(orderBy: postCount_desc) {
            id
            name
            slug
            icon
            postCount
          }
        }
      `)
    }
  }
}
</script>
