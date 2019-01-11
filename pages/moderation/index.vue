<template>
  <ds-card space="small">
    <ds-heading tag="h3">
      {{ $t('moderation.reports.name') }}
    </ds-heading>
    <ds-table
      :data="Report"
      :fields="fields"
      condensed
    >
      <template
        slot="type"
        slot-scope="scope"
      >
        <template v-if="scope.row.type === 'contribution'">
          <nuxt-link :to="{ name: 'post-slug', params: { slug: scope.row.contribution.slug } }">
            <b>{{ scope.row.contribution.title | truncate(50) }}</b>
          </nuxt-link>
        </template>
        <template v-else-if="scope.row.type === 'comment'">
          <nuxt-link :to="{ name: 'post-slug', params: { slug: scope.row.comment.contribution.slug } }">
            <b>{{ scope.row.comment.contentExcerpt | truncate(50) }}</b>
          </nuxt-link>
        </template>
        <template v-else>
          <nuxt-link :to="{ name: 'profile-slug', params: { slug: scope.row.user.slug } }">
            <b>{{ scope.row.user.name | truncate(50) }}</b>
          </nuxt-link>
        </template><br>
        <ds-text
          size="small"
          color="soft"
        >
          {{ scope.row.type }}
        </ds-text>
      </template>
      <template
        slot="reporter"
        slot-scope="scope"
      >
        <nuxt-link :to="{ name: 'profile-slug', params: { slug: scope.row.reporter.slug } }">
          {{ scope.row.reporter.name }}
        </nuxt-link>
      </template>
      <template slot="actions">
        <no-ssr>
          <dropdown
            class="moderation-menu"
            placement="left"
            offset="5"
          >
            <template
              slot="default"
              slot-scope="{toggleMenu}"
            >
              <a
                class="moderation-menu-trigger"
                href="#"
                @click.prevent="toggleMenu"
              >
                <ds-icon name="ellipsis-v" />
              </a>
            </template>
            <template
              slot="popover"
            >
              Actions...
            </template>
          </dropdown>
        </no-ssr>
      </template>
    </ds-table>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import Dropdown from '~/components/Dropdown'

export default {
  components: {
    Dropdown
  },
  data() {
    return {
      Report: []
    }
  },
  computed: {
    fields() {
      return {
        type: ' ',
        reporter: this.$t('moderation.reports.reporter'),
        actions: ' '
      }
    }
  },
  apollo: {
    Report: {
      query: gql(`
        query {
          Report(first: 20, orderBy: createdAt_desc) {
            id
            description
            type
            createdAt
            reporter {
              name
              slug
            }
            user {
              name
              slug
            }
            comment {
              contentExcerpt
              author {
                name
                slug
              }
              post {
                title
                slug
              }
            }
            contribution {
              title
              slug
              author {
                name
                slug
              }
            }
          }
        }
      `)
    }
  }
}
</script>
