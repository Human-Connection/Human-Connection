<template>
  <div class="admin-users">
    <base-card>
      <h2 class="title">{{ $t('admin.users.name') }}</h2>
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
            <base-button filled circle type="submit" icon="search" :loading="$apollo.loading" />
          </ds-flex-item>
        </ds-flex>
      </ds-form>
    </base-card>
    <base-card v-if="User && User.length">
      <ds-table :data="User" :fields="fields" condensed>
        <template #index="scope">{{ scope.row.index + 1 }}.</template>
        <template #name="scope">
          <nuxt-link
            :to="{
              name: 'profile-id-slug',
              params: { id: scope.row.id, slug: scope.row.slug },
            }"
          >
            <b>{{ scope.row.name | truncate(20) }}</b>
          </nuxt-link>
        </template>
        <template #email="scope">
          <a :href="`mailto:${scope.row.email}`">
            <b>{{ scope.row.email }}</b>
          </a>
        </template>
        <template #slug="scope">
          <nuxt-link
            :to="{
              name: 'profile-id-slug',
              params: { id: scope.row.id, slug: scope.row.slug },
            }"
          >
            <b>{{ scope.row.slug | truncate(20) }}</b>
          </nuxt-link>
        </template>
        <template #createdAt="scope">
          {{ scope.row.createdAt | dateTime }}
        </template>
      </ds-table>
      <pagination-buttons :hasNext="hasNext" :hasPrevious="hasPrevious" @next="next" @back="back" />
    </base-card>
    <base-card v-else>
      <ds-placeholder>{{ $t('admin.users.empty') }}</ds-placeholder>
    </base-card>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { isEmail } from 'validator'
import normalizeEmail from '~/components/utils/NormalizeEmail'
import PaginationButtons from '~/components/_new/generic/PaginationButtons/PaginationButtons'

export default {
  components: {
    PaginationButtons,
  },
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
        index: this.$t('admin.users.table.columns.number'),
        name: this.$t('admin.users.table.columns.name'),
        email: this.$t('admin.users.table.columns.email'),
        slug: this.$t('admin.users.table.columns.slug'),
        createdAt: this.$t('admin.users.table.columns.createdAt'),
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
        return gql`
          query($filter: _UserFilter, $first: Int, $offset: Int, $email: String) {
            User(
              email: $email
              filter: $filter
              first: $first
              offset: $offset
              orderBy: createdAt_desc
            ) {
              id
              name
              slug
              email
              role
              createdAt
              contributionsCount
              commentedCount
              shoutedCount
            }
          }
        `
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
      if (isEmail(query)) {
        this.email = normalizeEmail(query)
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

<style lang="scss">
.admin-users > .base-card:first-child {
  margin-bottom: $space-small;
}
</style>
