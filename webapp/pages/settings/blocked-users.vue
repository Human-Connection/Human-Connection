<template>
  <div>
    <ds-space>
      <base-card>
        <h2 class="title">{{ $t('settings.blocked-users.name') }}</h2>
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
            {{ $t('settings.blocked-users.explanation.notifications') }}
          </ds-list-item>
        </ds-list>
      </base-card>
    </ds-space>
    <base-card v-if="blockedUsers && blockedUsers.length">
      <ds-table :data="blockedUsers" :fields="fields" condensed>
        <template #avatar="scope">
          <nuxt-link
            :to="{
              name: 'profile-id-slug',
              params: { id: scope.row.id, slug: scope.row.slug },
            }"
          >
            <user-avatar :user="scope.row" size="small" />
          </nuxt-link>
        </template>
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

        <template #unblockUser="scope">
          <base-button circle size="small" @click="unblockUser(scope)" icon="user-plus" />
        </template>
      </ds-table>
    </base-card>
    <base-card v-else>
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
    </base-card>
  </div>
</template>

<script>
import { blockedUsers, unblockUser } from '~/graphql/settings/BlockedUsers'
import UserAvatar from '~/components/_new/generic/UserAvatar/UserAvatar'

export default {
  components: {
    UserAvatar,
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
        unblockUser: this.$t('settings.blocked-users.columns.unblock'),
      }
    },
  },
  apollo: {
    blockedUsers: { query: blockedUsers, fetchPolicy: 'cache-and-network' },
  },
  methods: {
    async unblockUser(user) {
      await this.$apollo.mutate({
        mutation: unblockUser(),
        variables: { id: user.row.id },
      })
      this.$apollo.queries.blockedUsers.refetch()
      const { name } = user.row
      this.$toast.success(this.$t('settings.blocked-users.unblocked', { name }))
    },
  },
}
</script>

<style lang="scss">
.ds-table-col {
  vertical-align: middle;
}
</style>
