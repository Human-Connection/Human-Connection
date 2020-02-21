<template>
  <div>
    <ds-space>
      <base-card>
        <h2 class="title">{{ $t('settings.muted-users.name') }}</h2>
        <ds-text>
          {{ $t('settings.muted-users.explanation.intro') }}
        </ds-text>
        <ds-list>
          <ds-list-item>
            {{ $t('settings.muted-users.explanation.your-perspective') }}
          </ds-list-item>
          <ds-list-item>
            {{ $t('settings.muted-users.explanation.search') }}
          </ds-list-item>
        </ds-list>
      </base-card>
    </ds-space>
    <base-card v-if="mutedUsers && mutedUsers.length">
      <ds-table :data="mutedUsers" :fields="fields" condensed>
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

        <template #unmuteUser="scope">
          <base-button circle size="small" @click="unmuteUser(scope)" icon="user-plus" />
        </template>
      </ds-table>
    </base-card>
    <base-card v-else>
      <ds-space>
        <ds-placeholder>
          {{ $t('settings.muted-users.empty') }}
        </ds-placeholder>
      </ds-space>
      <ds-space>
        <ds-text align="center">
          {{ $t('settings.muted-users.how-to') }}
        </ds-text>
      </ds-space>
    </base-card>
  </div>
</template>

<script>
import { mutedUsers, unmuteUser } from '~/graphql/settings/MutedUsers'
import UserAvatar from '~/components/_new/generic/UserAvatar/UserAvatar'

export default {
  components: {
    UserAvatar,
  },
  data() {
    return {
      mutedUsers: [],
    }
  },
  computed: {
    fields() {
      return {
        avatar: '',
        name: this.$t('settings.muted-users.columns.name'),
        slug: this.$t('settings.muted-users.columns.slug'),
        unmuteUser: this.$t('settings.muted-users.columns.unmute'),
      }
    },
  },
  apollo: {
    mutedUsers: { query: mutedUsers, fetchPolicy: 'cache-and-network' },
  },
  methods: {
    async unmuteUser(user) {
      await this.$apollo.mutate({
        mutation: unmuteUser(),
        variables: { id: user.row.id },
      })
      this.$apollo.queries.mutedUsers.refetch()
      const { name } = user.row
      this.$toast.success(this.$t('settings.muted-users.unmuted', { name }))
    },
  },
}
</script>

<style lang="scss">
.ds-table-col {
  vertical-align: middle;
}
</style>
