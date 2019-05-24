<template>
  <ds-card :header="$t('admin.tags.name')">
    <ds-table
      :data="Tag"
      :fields="fields"
      condensed
    >
      <template
        slot="id"
        slot-scope="scope"
      >
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
    }
  },
  computed: {
    fields() {
      return {
        id: '#',
        name: 'Name',
        taggedCountUnique: {
          label: this.$t('admin.tags.tagCountUnique'),
          align: 'right',
        },
        taggedCount: {
          label: this.$t('admin.tags.tagCount'),
          align: 'right',
        },
      }
    },
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
      `),
    },
  },
}
</script>
