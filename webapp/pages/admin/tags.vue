<template>
  <ds-card :header="$t('admin.tags.name')">
    <ds-table :data="Tag" :fields="fields" condensed>
      <template slot="index" slot-scope="scope">
        {{ scope.index + 1 }}.
      </template>
      <template slot="id" slot-scope="scope">
        <nuxt-link :to="{ path: '/', query: { hashtag: scope.row.id } }">
          <b>#{{ scope.row.id | truncate(20) }}</b>
        </nuxt-link>
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
        index: this.$t('admin.tags.number'),
        id: this.$t('admin.tags.name'),
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
      query: gql`
        query {
          Tag(first: 20, orderBy: taggedCountUnique_desc) {
            id
            taggedCount
            taggedCountUnique
          }
        }
      `,
    },
  },
}
</script>
