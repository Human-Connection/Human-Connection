<template>
  <ds-card :header="$t('admin.users.name')">
    <ds-table v-if="User && User.length" :data="User" :fields="fields" condensed>
      <template slot="name" slot-scope="scope">
        <nuxt-link
          :to="{
            name: 'profile-id-slug',
            params: { id: scope.row.id, slug: scope.row.slug },
          }"
        >
          <b>{{ scope.row.name | truncate(50) }}</b>
        </nuxt-link>
      </template>
    </ds-table>
    <ds-flex direction="row-reverse">
      <ds-flex-item width="50px">
        <ds-button @click="next" :disabled="!hasNext" icon="arrow-right" primary />
      </ds-flex-item>
      <ds-flex-item width="50px">
        <ds-button @click="back" :disabled="!hasPrevious" icon="arrow-left" primary />
      </ds-flex-item>
    </ds-flex>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    const pageSize = 15
    return {
      offset: 0,
      pageSize,
      first: pageSize,
      User: [],
    }
  },
  computed: {
    hasNext() {
      const { countUsers } = this.statistics
      return this.offset < countUsers - this.pageSize
    },
    hasPrevious() {
      return this.offset > 0
    },
    fields() {
      return {
        id: 'ID',
        name: this.$t('admin.users.table.columns.name'),
        slug: this.$t('admin.users.table.columns.slug'),
        role: this.$t('admin.users.table.columns.role'),
      }
    },
  },
  apollo: {
    statistics: {
      query() {
        return gql('query { statistics { countUsers } }')
      },
    },
    User: {
      query() {
        return gql(`
        query($filter: _UserFilter, $first: Int, $offset: Int) {
          User(filter: $filter, first: $first, offset: $offset, orderBy: createdAt_desc) {
            id
            name
            slug
            role
          }
        }
      `)
      },
      variables() {
        const { offset, first } = this
        return { first, offset }
      },
    },
  },
  methods: {
    back() {
      this.offset -= this.pageSize
      this.offset = Math.max(this.offset, 0)
    },
    next() {
      this.offset += this.pageSize
      const { countUsers } = this.statistics
      this.offset = Math.min(this.offset, countUsers - this.pageSize)
    },
  },
}
</script>
