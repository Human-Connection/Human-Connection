<template>
  <base-card style="position: relative; height: 424px;">
    <ds-space v-if="this.connections && this.connections.length" margin="x-small">
      <ds-text tag="h5" color="soft">
        {{ userName | truncate(15) }} {{ $t(`profile.network.${type}`) }}
      </ds-text>
    </ds-space>
    <ds-space v-if="this.connections && this.connections.length > 7" margin="x-small">
      <ds-input
        ref="filter"
        @input.native="setFilter"
        placeholder="filter"
        v-focus="true"
        size="small"
        icon="filter"
      />
    </ds-space>
    <template v-if="this.connections && this.connections.length <= 7">
      <ds-space v-for="follow in uniq(this.connections)" :key="follow.id" margin="x-small">
        <!-- TODO: find better solution for rendering errors -->
        <client-only>
          <user-teaser :user="follow" />
        </client-only>
      </ds-space>
      <ds-space v-if="this.allConnectionsCount - this.connections.length" margin="small">
        <base-button @click="fetchConnections" size="small" color="softer">
          {{
            $t('profile.network.andMore', {
              number: this.allConnectionsCount - this.connections.length,
            })
          }}
        </base-button>
      </ds-space>
    </template>
    <template v-else-if="this.connections.length > 7">
      <div class="overflow-container">
        <ds-space
          v-for="follow in uniq(this.filteredConnections)"
          :key="follow.id"
          margin="x-small"
        >
          <client-only>
            <user-teaser :user="follow" />
          </client-only>
        </ds-space>
      </div>
    </template>
    <template v-else>
      <p style="text-align: center; opacity: 0.5;">
        {{ userName }} {{ $t(`profile.network.${type}Nobody`) }}
      </p>
    </template>
  </base-card>
</template>

<script>
import uniqBy from 'lodash/uniqBy'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import { followedByQuery, followingQuery } from '~/graphql/User'

export default {
  name: 'FollowerList',
  components: {
    UserTeaser,
  },
  props: {
    user: { type: Object, default: null },
    type: { type: String, default: 'following' },
  },
  data() {
    return {
      additionalConnections: [],
      filter: null,
      queries: {
        followedBy: followedByQuery,
        following: followingQuery,
      },
    }
  },
  computed: {
    userName() {
      const { name } = this.user || {}
      return name || this.$t('profile.userAnonym')
    },
    connections() {
      return [...this.user[this.type], ...this.additionalConnections]
    },
    filteredConnections() {
      if (!this.filter) {
        return this.connections
      }

      const fuzzyExpression = new RegExp(
        `${this.filter.split('').reduce((part, c) => `${part}[^${c}]*${c}`)}`,
        'i',
      )

      const fuzzyScores = this.connections
        .map((user) => {
          const match = user.name.match(fuzzyExpression)

          return {
            user,
            score: match ? match[0].length * (match.index + 1) : -1,
          }
        })
        .filter((score) => score.score !== -1)
        .sort((a, b) => a.score - b.score)

      return fuzzyScores.map((score) => score.user)
    },
    allConnectionsCount() {
      return this.user[`${this.type}Count`]
    },
  },
  methods: {
    uniq(items, field = 'id') {
      return uniqBy(items, field)
    },
    async fetchConnections() {
      const { data } = await this.$apollo.query({
        query: this.queries[this.type],
        variables: { id: this.user.id },
        // neither result nor update are being called when defined here (?)
      })
      this.additionalConnections = data.User[0][this.type]
    },
    setFilter(evt) {
      this.$set(this, 'filter', evt.target.value)
    },
  },
}
</script>

<style lang="scss">
.overflow-container {
  max-height: 300px;
  overflow-y: auto;
}
</style>
