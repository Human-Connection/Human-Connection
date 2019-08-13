<template>
  <div>
    <ds-space>
      <ds-card :header="$t('settings.blocked-users.name')">
        <ds-text>
          {{ $t('settings.blocked-users.explanation.intro') }}
        </ds-text>
        <ds-list>
          <ds-list-item>
            {{ $t('settings.blocked-users.explanation.your-perspective') }}
          </ds-list-item>
          <ds-list-item>
            {{ $t('settings.blocked-users.explanation.their-perspective') }}
          </ds-list-item>
          <ds-list-item>
            {{ $t('settings.blocked-users.explanation.search') }}
          </ds-list-item>
          <ds-list-item>
            {{ $t('settings.blocked-users.explanation.notifications') }}
          </ds-list-item>
        </ds-list>
        <ds-text>
          {{ $t('settings.blocked-users.explanation.closing') }}
        </ds-text>
      </ds-card>
    </ds-space>
    <ds-card v-if="blockedUsers && blockedUsers.length">
      <ds-table :data="blockedUsers" :fields="fields" condensed>
        <template slot="avatar" slot-scope="scope">
          <nuxt-link
            :to="{
              name: 'profile-id-slug',
              params: { id: scope.row.id, slug: scope.row.slug },
            }"
          >
            <hc-avatar :user="scope.row" size="small" />
          </nuxt-link>
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
    </ds-card>
    <ds-card v-else>
      <ds-space>
        <ds-placeholder>
          {{ $t('settings.blocked-users.empty') }}
        </ds-placeholder>
      </ds-space>
      <ds-space>
        <ds-text align="center">
          {{ $t('settings.blocked-users.how-to') }}
        </ds-text>
      </ds-space>
    </ds-card>
  </div>
</template>

<script>
import { BlockedUsers } from '~/graphql/settings/BlockedUsers'
import HcAvatar from '~/components/Avatar/Avatar.vue'

export default {
  components: {
    HcAvatar,
  },
  data() {
    return {
      blockedUsers: [],
    }
  },
  computed: {
    fields() {
      return {
        avatar: '',
        name: this.$t('settings.blocked-users.columns.name'),
        slug: this.$t('settings.blocked-users.columns.slug'),
      }
    },
  },
  apollo: {
    blockedUsers: { query: BlockedUsers, fetchPolicy: 'cache-and-network' },
  },
}
</script>

<style lang="scss">
.ds-table-col {
  vertical-align: middle;
}
</style>
