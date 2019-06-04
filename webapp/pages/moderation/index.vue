<template>
  <ds-card space="small">
    <ds-heading tag="h3">
      {{ $t('moderation.reports.name') }}
    </ds-heading>
<<<<<<< HEAD
    <ds-table v-if="Report && Report.length" :data="Report" :fields="fields" condensed>
      <template slot="name" slot-scope="scope">
=======
    <ds-table
v-if="Report && Report.length" :data="Report"
:fields="fields" condensed
>
      <template
slot="name" slot-scope="scope"
>
>>>>>>> d239c95e322d741088fecea46a3902fa50f720ab
        <div v-if="scope.row.type === 'Post'">
          <nuxt-link
            :to="{
              name: 'post-id-slug',
              params: { id: scope.row.post.id, slug: scope.row.post.slug },
            }"
          >
            <b>{{ scope.row.post.title | truncate(50) }}</b>
          </nuxt-link>
<<<<<<< HEAD
          <br />
          <ds-text size="small" color="soft">
=======
          <br>
          <ds-text
size="small" color="soft"
>
>>>>>>> d239c95e322d741088fecea46a3902fa50f720ab
            {{ scope.row.post.author.name }}
          </ds-text>
        </div>
        <div v-else-if="scope.row.type === 'Comment'">
          <nuxt-link
            :to="{
              name: 'post-id-slug',
              params: { id: scope.row.comment.post.id, slug: scope.row.comment.post.slug },
            }"
          >
            <b>{{ scope.row.comment.contentExcerpt | truncate(50) }}</b>
          </nuxt-link>
<<<<<<< HEAD
          <br />
          <ds-text size="small" color="soft">
=======
          <br>
          <ds-text
size="small" color="soft"
>
>>>>>>> d239c95e322d741088fecea46a3902fa50f720ab
            {{ scope.row.comment.author.name }}
          </ds-text>
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
<<<<<<< HEAD
      <template slot="type" slot-scope="scope">
=======
      <template
slot="type" slot-scope="scope"
>
>>>>>>> d239c95e322d741088fecea46a3902fa50f720ab
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
<<<<<<< HEAD
      <template slot="submitter" slot-scope="scope">
=======
      <template
slot="submitter" slot-scope="scope"
>
>>>>>>> d239c95e322d741088fecea46a3902fa50f720ab
        <nuxt-link
          :to="{
            name: 'profile-id-slug',
            params: { id: scope.row.submitter.id, slug: scope.row.submitter.slug },
          }"
        >
          {{ scope.row.submitter.name }}
        </nuxt-link>
      </template>
<<<<<<< HEAD
      <template slot="disabledBy" slot-scope="scope">
=======
      <template
slot="disabledBy" slot-scope="scope"
>
>>>>>>> d239c95e322d741088fecea46a3902fa50f720ab
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
      </template>
    </ds-table>
<<<<<<< HEAD
    <hc-empty v-else icon="alert" :message="$t('moderation.reports.empty')" />
=======
    <hc-empty
v-else icon="alert"
:message="$t('moderation.reports.empty')"
/>
>>>>>>> d239c95e322d741088fecea46a3902fa50f720ab
  </ds-card>
</template>

<script>
import HcEmpty from '~/components/Empty.vue'
import query from '~/graphql/ModerationListQuery.js'

export default {
  components: {
    HcEmpty,
  },
  data() {
    return {
      Report: [],
    }
  },
  computed: {
    fields() {
      return {
        type: ' ',
        name: ' ',
        submitter: this.$t('moderation.reports.submitter'),
        disabledBy: this.$t('moderation.reports.disabledBy'),
        // actions: ' '
      }
    },
  },
  apollo: {
    Report: {
      query,
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
