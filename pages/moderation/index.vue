<template>
  <ds-card space="small">
    <ds-heading tag="h3">
      {{ $t('moderation.reports.name') }}
    </ds-heading>
    <ds-table
      v-if="Report && Report.length"
      :data="Report"
      :fields="fields"
      condensed
    >
      <template
        slot="name"
        slot-scope="scope"
      >
        <div v-if="scope.row.type === 'contribution'">
          <nuxt-link :to="{ name: 'post-slug', params: { slug: scope.row.contribution.slug } }">
            <b>{{ scope.row.contribution.title | truncate(50) }}</b>
          </nuxt-link><br>
          <ds-text
            size="small"
            color="soft"
          >
            {{ scope.row.contribution.author.name }}
          </ds-text>
        </div>
        <div v-else-if="scope.row.type === 'comment'">
          <nuxt-link :to="{ name: 'post-slug', params: { slug: scope.row.comment.post.slug } }">
            <b>{{ scope.row.comment.contentExcerpt | truncate(50) }}</b>
          </nuxt-link><br>
          <ds-text
            size="small"
            color="soft"
          >
            {{ scope.row.comment.author.name }}
          </ds-text>
        </div>
        <div v-else>
          <nuxt-link :to="{ name: 'profile-slug', params: { slug: scope.row.user.slug } }">
            <b>{{ scope.row.user.name | truncate(50) }}</b>
          </nuxt-link>
        </div>
      </template>
      <template
        slot="type"
        slot-scope="scope"
      >
        <ds-text
          color="soft"
        >
          <ds-icon
            v-if="scope.row.type === 'contribution'"
            v-tooltip="{ content: $t(`report.${scope.row.type}.type`), placement: 'right' }"
            name="bookmark"
          />
          <ds-icon
            v-else-if="scope.row.type === 'comment'"
            v-tooltip="{ content: $t(`report.${scope.row.type}.type`), placement: 'right' }"
            name="comments"
          />
          <ds-icon
            v-else
            v-tooltip="{ content: $t(`report.${scope.row.type}.type`), placement: 'right' }"
            name="user"
          />
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
    </ds-table>
    <hc-empty
      v-else
      icon="alert"
      :message="$t('moderation.reports.empty')"
    />
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import HcEmpty from '~/components/Empty.vue'
import query from '~/graphql/ModerationListQuery.js'

export default {
  components: {
    HcEmpty
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
        name: ' ',
        reporter: this.$t('moderation.reports.reporter')
        // actions: ' '
      }
    }
  },
  apollo: {
    Report: {
      query,
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
