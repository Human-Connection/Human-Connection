<template>
  <ds-card :header="$t('admin.tags.name')">
<<<<<<< HEAD
    <ds-table :data="Tag" :fields="fields" condensed>
      <template slot="id" slot-scope="scope">
=======
    <ds-table
:data="Tag" :fields="fields"
condensed
>
      <template
slot="id" slot-scope="scope"
>
>>>>>>> d239c95e322d741088fecea46a3902fa50f720ab
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
