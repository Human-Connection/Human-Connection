<template>
  <div>
    <ds-space>
      <ds-card :header="$t('admin.users.name')">
        <ds-form v-model="form" @submit="submit">
          <ds-flex gutter="small">
            <ds-flex-item width="90%">
              <ds-input
                model="query"
                :placeholder="$t('admin.users.form.placeholder')"
                icon="search"
              />
            </ds-flex-item>
            <ds-flex-item width="30px">
              <ds-button primary type="submit" icon="search" :loading="$apollo.loading" />
            </ds-flex-item>
          </ds-flex>
        </ds-form>
      </ds-card>
    </ds-space>
    <ds-card v-if="User && User.length">
      <ds-table :data="User" :fields="fields" condensed>
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
            <b>{{ scope.row.name | truncate(20) }}</b>
          </nuxt-link>
        </template>
        <template slot="slug" slot-scope="scope">
          <nuxt-link
            :to="{
              name: 'profile-id-slug',
              params: { id: scope.row.id, slug: scope.row.slug },
            }"
          >
            <b>{{ scope.row.slug | truncate(20) }}</b>
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
    <ds-card v-else>
      <ds-placeholder>
        {{ $t('admin.users.empty') }}
      </ds-placeholder>
    </ds-card>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import isemail from 'isemail'

export default {
  data() {
    const pageSize = 15
    return {
      offset: 0,
      pageSize,
      first: pageSize,
      User: [],
      hasNext: false,
      email: null,
      filter: null,
      form: {
        formData: {
          query: '',
        },
      },
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
        contributionsCount: {
          label: '🖉',
          align: 'right',
        },
        commentedCount: {
          label: '🗨',
          align: 'right',
        },
        shoutedCount: {
          label: '❤',
          align: 'right',
        },
        role: {
          label: this.$t('admin.users.table.columns.role'),
          align: 'right',
        },
      }
    },
  },
  apollo: {
    User: {
      query() {
        return gql(`
        query($filter: _UserFilter, $first: Int, $offset: Int, $email: String) {
          User(email: $email, filter: $filter, first: $first, offset: $offset, orderBy: createdAt_desc) {
            id
            name
            slug
            role
            contributionsCount
            commentedCount
            shoutedCount
          }
        }
      `)
      },
      variables() {
        const { offset, first, email, filter } = this
        const variables = { first, offset }
        if (email) variables.email = email
        if (filter) variables.filter = filter
        return variables
      },
      update({ User }) {
        if (!User) return []
        this.hasNext = User.length >= this.pageSize
        if (User.length <= 0 && this.offset > 0) return this.User // edge case, avoid a blank page
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
    submit(formData) {
      this.offset = 0
      const { query } = formData
      if (isemail.validate(query)) {
        this.email = query
        this.filter = null
      } else {
        this.email = null
        this.filter = {
          OR: [{ name_contains: query }, { slug_contains: query }, { about_contains: query }],
        }
      }
    },
  },
}
</script>
