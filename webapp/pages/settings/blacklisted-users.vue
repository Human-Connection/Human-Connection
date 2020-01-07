<template>
  <div>
    <ds-space>
      <ds-card :header="$t('settings.blacklisted-users.name')">
        <ds-text>
          {{ $t('settings.blacklisted-users.explanation.intro') }}
        </ds-text>
        <ds-list>
          <ds-list-item>
            {{ $t('settings.blacklisted-users.explanation.your-perspective') }}
          </ds-list-item>
          <ds-list-item>
            {{ $t('settings.blacklisted-users.explanation.their-perspective') }}
          </ds-list-item>
          <ds-list-item>
            {{ $t('settings.blacklisted-users.explanation.search') }}
          </ds-list-item>
          <ds-list-item>
            {{ $t('settings.blacklisted-users.explanation.notifications') }}
          </ds-list-item>
        </ds-list>
        <ds-text>
          {{ $t('settings.blacklisted-users.explanation.closing') }}
        </ds-text>
      </ds-card>
    </ds-space>
    <ds-card v-if="blacklistedUsers && blacklistedUsers.length">
      <ds-table :data="blacklistedUsers" :fields="fields" condensed>
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

        <template slot="whitelistUserContent" slot-scope="scope">
          <ds-button size="small" @click="whitelistUserContent(scope)">
            <ds-icon name="user-plus" />
          </ds-button>
        </template>
      </ds-table>
    </ds-card>
    <ds-card v-else>
      <ds-space>
        <ds-placeholder>
          {{ $t('settings.blacklisted-users.empty') }}
        </ds-placeholder>
      </ds-space>
      <ds-space>
        <ds-text align="center">
          {{ $t('settings.blacklisted-users.how-to') }}
        </ds-text>
      </ds-space>
    </ds-card>
  </div>
</template>

<script>
import { blacklistedUsers, whitelistUserContent } from '~/graphql/settings/BlacklistedUsers'
import HcAvatar from '~/components/Avatar/Avatar.vue'

export default {
  components: {
    HcAvatar,
  },
  data() {
    return {
      blacklistedUsers: [],
    }
  },
  computed: {
    fields() {
      return {
        avatar: '',
        name: this.$t('settings.blacklisted-users.columns.name'),
        slug: this.$t('settings.blacklisted-users.columns.slug'),
        whitelistUserContent: this.$t('settings.blacklisted-users.columns.unblock'),
      }
    },
  },
  apollo: {
    blacklistedUsers: { query: blacklistedUsers, fetchPolicy: 'cache-and-network' },
  },
  methods: {
    async whitelistUserContent(user) {
      await this.$apollo.mutate({
        mutation: whitelistUserContent(),
        variables: { id: user.row.id },
      })
      this.$apollo.queries.blacklistedUsers.refetch()
      const { name } = user.row
      this.$toast.success(this.$t('settings.blacklisted-users.unblocked', { name }))
    },
  },
}
</script>

<style lang="scss">
.ds-table-col {
  vertical-align: middle;
}
</style>
