<template>
  <ds-card :header="$t('admin.users.name')">
    <ds-table v-if="User && User.length" :data="User" :fields="fields" condensed>
      <template slot="index" slot-scope="scope">
        {{ scope.row.index }}.
      </template>
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
      hasNext: false,
    }
  },
  computed: {
    hasPrevious() {
      return this.offset > 0
    },
    fields() {
      return {
        index: '#',
        name: this.$t('admin.users.table.columns.name'),
        slug: this.$t('admin.users.table.columns.slug'),
        role: this.$t('admin.users.table.columns.role'),
      }
    },
  },
  apollo: {
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
      update({ User }) {
        this.hasNext = User && User.length >= this.pageSize
        if (User.length <= 0) return this.User // edge case, avoid a blank page
        return User.map((u, i) => Object.assign({}, u, { index: this.offset + i }))
      },
    },
  },
  methods: {
    back() {
      this.offset = Math.max(this.offset - this.pageSize, 0)
    },
    next() {
      this.offset += this.pageSize
    },
  },
}
</script>
