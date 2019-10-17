<template>
  <ds-card space="small">
    <ds-heading tag="h3">{{ $t('moderation.reports.name') }}</ds-heading>
    <ds-table v-if="reports && reports.length" :data="reports" :fields="fields" condensed>
      <!-- Icon -->
      <template slot="type" slot-scope="scope">
        <ds-text color="soft">
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
      <!-- reported user or content -->
      <template slot="reportedUserContent" slot-scope="scope">
        <div v-if="scope.row.type === 'Post'">
          <nuxt-link
            :to="{
              name: 'post-id-slug',
              params: { id: scope.row.post.id, slug: scope.row.post.slug },
            }"
          >
            <b>{{ scope.row.post.title | truncate(50) }}</b>
          </nuxt-link>
          <br />
          <ds-text size="small" color="soft">{{ scope.row.post.author.name }}</ds-text>
        </div>
        <div v-else-if="scope.row.type === 'Comment'">
          <nuxt-link
            :to="{
              name: 'post-id-slug',
              params: {
                id: scope.row.comment.post.id,
                slug: scope.row.comment.post.slug,
              },
              hash: `#commentId-${scope.row.comment.id}`,
            }"
          >
            <b>{{ scope.row.comment.contentExcerpt | removeHtml | truncate(50) }}</b>
          </nuxt-link>
          <br />
          <ds-text size="small" color="soft">{{ scope.row.comment.author.name }}</ds-text>
        </div>
        <div v-else>
          <nuxt-link
            :to="{
              name: 'profile-id-slug',
              params: { id: scope.row.user.id, slug: scope.row.user.slug },
            }"
          >
            <b>{{ scope.row.user.name | truncate(50) }}</b>
          </nuxt-link>
        </div>
      </template>
      <!-- reasonCategory -->
      <template slot="reasonCategory" slot-scope="scope">
        {{ $t('report.reason.category.options.' + scope.row.reasonCategory) }}
      </template>
      <!-- reasonDescription -->
      <template slot="reasonDescription" slot-scope="scope">
        {{ scope.row.reasonDescription }}
      </template>
      <!-- submitter -->
      <template slot="submitter" slot-scope="scope">
        <nuxt-link
          :to="{
            name: 'profile-id-slug',
            params: { id: scope.row.submitter.id, slug: scope.row.submitter.slug },
          }"
        >
          {{ scope.row.submitter.name }}
        </nuxt-link>
      </template>
      <!-- createdAt -->
      <template slot="createdAt" slot-scope="scope">
        <ds-text size="small">
          <client-only>
            <hc-relative-date-time :date-time="scope.row.createdAt" />
          </client-only>
        </ds-text>
      </template>
      <!-- disabledBy -->
      <template slot="disabledBy" slot-scope="scope">
        <nuxt-link
          v-if="scope.row.type === 'Post' && scope.row.post.disabledBy"
          :to="{
            name: 'profile-id-slug',
            params: { id: scope.row.post.disabledBy.id, slug: scope.row.post.disabledBy.slug },
          }"
        >
          <b>{{ scope.row.post.disabledBy.name | truncate(50) }}</b>
        </nuxt-link>
        <nuxt-link
          v-else-if="scope.row.type === 'Comment' && scope.row.comment.disabledBy"
          :to="{
            name: 'profile-id-slug',
            params: {
              id: scope.row.comment.disabledBy.id,
              slug: scope.row.comment.disabledBy.slug,
            },
          }"
        >
          <b>{{ scope.row.comment.disabledBy.name | truncate(50) }}</b>
        </nuxt-link>
        <nuxt-link
          v-else-if="scope.row.type === 'User' && scope.row.user.disabledBy"
          :to="{
            name: 'profile-id-slug',
            params: { id: scope.row.user.disabledBy.id, slug: scope.row.user.disabledBy.slug },
          }"
        >
          <b>{{ scope.row.user.disabledBy.name | truncate(50) }}</b>
        </nuxt-link>
        <b v-else>—</b>
      </template>
    </ds-table>
    <hc-empty v-else icon="alert" :message="$t('moderation.reports.empty')" />
  </ds-card>
</template>

<script>
import HcEmpty from '~/components/Empty.vue'
import HcRelativeDateTime from '~/components/RelativeDateTime'
import { reportListQuery } from '~/graphql/Moderation.js'

export default {
  components: {
    HcEmpty,
    HcRelativeDateTime,
  },
  data() {
    return {
      reports: [],
    }
  },
  computed: {
    fields() {
      return {
        type: ' ',
        reportedUserContent: ' ',
        reasonCategory: this.$t('moderation.reports.reasonCategory'),
        reasonDescription: this.$t('moderation.reports.reasonDescription'),
        submitter: this.$t('moderation.reports.submitter'),
        createdAt: this.$t('moderation.reports.createdAt'),
        disabledBy: this.$t('moderation.reports.disabledBy'),
        // actions: ' '
      }
    },
  },
  apollo: {
    reports: {
      query: reportListQuery(),
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
