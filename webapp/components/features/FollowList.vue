<template>
  <base-card style="position: relative; height: auto;">
    <ds-space v-if="this.connections && this.connections.length" margin="x-small">
      <ds-text tag="h5" color="soft">
        {{ userName | truncate(15) }} {{ $t('profile.network.following') }}
      </ds-text>
    </ds-space>
    <template v-if="this.connections && this.connections.length">
      <ds-space v-for="follow in uniq(this.connections)" :key="follow.id" margin="x-small">
        <!-- TODO: find better solution for rendering errors -->
        <client-only>
          <user-teaser :user="follow" />
        </client-only>
      </ds-space>
      <ds-space v-if="this.user.followedByCount - this.connections.length" margin="small">
        <ds-text size="small" color="soft">
        {{
          $t('profile.network.andMore', {
            number: this.user.followedByCount - this.connections.length,
          })
        }}
        </ds-text>
      </ds-space>
    </template>
    <template v-else>
      <p style="text-align: center; opacity: .5;">
        {{ userName }} {{ $t('profile.network.followingNobody') }}
      </p>
    </template>
  </base-card>
</template>

<script>
import uniqBy from 'lodash/uniqBy'
import UserAvatar from '~/components/_new/generic/UserAvatar/UserAvatar'
import UserTeaser from '~/components/UserTeaser/UserTeaser'

let expanded = false

export default {
  name: 'FollowerList',
  components: {
    UserAvatar,
    UserTeaser,
  },
  props: {
    user: { type: Object, default: null },
    type: { type: String, default: 'following' },
  },
  data() {
    return {
      connections: this.user[this.type],
    }
  },
  computed: {
    userName() {
      const { name } = this.user || {}
      return name || this.$t('profile.userAnonym')
    },
  },
  methods: {
    uniq(items, field = 'id') {
      return uniqBy(items, field)
    },
  },
}
</script>
