<template>
  <base-card>
    <h2 class="title">{{ $t('admin.hashtags.name') }}</h2>
    <ds-table :data="Tag" :fields="fields" condensed>
      <template #index="scope">{{ scope.index + 1 }}.</template>
      <template #id="scope">
        <nuxt-link :to="{ path: '/', query: { hashtag: encodeURI(scope.row.id) } }">
          <b>#{{ scope.row.id | truncate(20) }}</b>
        </nuxt-link>
      </template>
    </ds-table>
  </base-card>
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
        index: this.$t('admin.hashtags.number'),
        id: this.$t('admin.hashtags.name'),
        taggedCountUnique: {
          label: this.$t('admin.hashtags.tagCountUnique'),
          align: 'right',
        },
        taggedCount: {
          label: this.$t('admin.hashtags.tagCount'),
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
