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
        <div v-if="scope.row.type === 'Post'">
          <nuxt-link :to="{ name: 'post-slug', params: { slug: scope.row.post.slug } }">
            <b>{{ scope.row.post.title | truncate(50) }}</b>
          </nuxt-link><br>
          <ds-text
            size="small"
            color="soft"
          >
            {{ scope.row.post.author.name }}
          </ds-text>
        </div>
        <div v-else-if="scope.row.type === 'Comment'">
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
            v-if="scope.row.type === 'Post'"
            v-tooltip="{ content: $t('report.contribution.type'), placement: 'right' }"
            name="bookmark"
          />
          <ds-icon
            v-else-if="scope.row.type === 'Comment'"
            v-tooltip="{ content: $t('report.comment.type'), placement: 'right' }"
            name="comments"
          />
          <ds-icon
            v-else-if="scope.row.type === 'User'"
            v-tooltip="{ content: $t('report.user.type'), placement: 'right' }"
            name="user"
          />
        </ds-text>
      </template>
      <template
        slot="submitter"
        slot-scope="scope"
      >
        <nuxt-link :to="{ name: 'profile-slug', params: { slug: scope.row.submitter.slug } }">
          {{ scope.row.submitter.name }}
        </nuxt-link>
      </template>
      <template
        slot="disabledBy"
        slot-scope="scope"
      >
        <nuxt-link
          v-if="scope.row.type === 'Post' && scope.row.post.disabledBy"
          :to="{ name: 'profile-slug', params: { slug: scope.row.post.disabledBy.slug } }"
        >
          <b>{{ scope.row.post.disabledBy.name | truncate(50) }}</b>
        </nuxt-link>
        <nuxt-link
          v-else-if="scope.row.type === 'Comment' && scope.row.comment.disabledBy"
          :to="{ name: 'profile-slug', params: { slug: scope.row.comment.disabledBy.slug } }"
        >
          <b>{{ scope.row.comment.disabledBy.name | truncate(50) }}</b>
        </nuxt-link>
        <nuxt-link
          v-else-if="scope.row.type === 'User' && scope.row.user.disabledBy"
          :to="{ name: 'profile-slug', params: { slug: scope.row.user.disabledBy.slug } }"
        >
          <b>{{ scope.row.user.disabledBy.name | truncate(50) }}</b>
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
        submitter: this.$t('moderation.reports.submitter'),
        disabledBy: this.$t('moderation.reports.disabledBy')
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
