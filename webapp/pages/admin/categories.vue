<template>
  <ds-card :header="$t('admin.categories.name')">
    <ds-table
      :data="Category"
      :fields="fields"
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
  computed: {
    fields() {
      return {
        icon: ' ',
        name: this.$t('admin.categories.categoryName'),
        postCount: {
          label: this.$t('admin.categories.postCount'),
          align: 'right'
        }
      }
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
