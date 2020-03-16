<template>
  <base-card>
    <h2 class="title">{{ $t('admin.categories.name') }}</h2>
    <ds-table :data="Category" :fields="fields" condensed>
      <template #icon="scope">
        <base-icon :name="scope.row.icon" />
      </template>
    </ds-table>
  </base-card>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      Category: [],
    }
  },
  computed: {
    fields() {
      return {
        icon: ' ',
        name: this.$t('admin.categories.categoryName'),
        postCount: {
          label: this.$t('admin.categories.postCount'),
          align: 'right',
        },
      }
    },
  },
  apollo: {
    Category: {
      query: gql`
        query {
          Category(orderBy: postCount_desc) {
            id
            name
            slug
            icon
            postCount
          }
        }
      `,
    },
  },
}
</script>
