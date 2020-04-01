<template>
  <base-card class="follow-list">
    <template v-if="connections && connections.length">
      <ds-text tag="h5" color="soft" class="spacer-x-small">
        {{ userName | truncate(15) }} {{ $t(`profile.network.${type}`) }}
      </ds-text>
      <div :class="connectionsClass">
        <user-teaser
          v-for="connection in filteredConnections"
          :user="connection"
          :key="connection.id"
          class="spacer-x-small"
        />
      </div>
      <base-button
        v-if="allConnectionsCount - connections.length"
        :loading="loading"
        size="small"
        color="softer"
        class="spacer-x-small"
        @click="$emit('fetchAllConnections', type)"
      >
        {{
          $t('profile.network.andMore', {
            number: allConnectionsCount - connections.length,
          })
        }}
      </base-button>
      <ds-input
        v-if="connections.length > 7"
        v-focus="true"
        :placeholder="filter"
        size="small"
        icon="filter"
        :name="`${type}Filter`"
        class="spacer-x-small"
        @input.native="setFilter"
      />
    </template>
    <p v-else class="nobody-message">{{ userName }} {{ $t(`profile.network.${type}Nobody`) }}</p>
  </base-card>
</template>

<script>
import { escape } from 'xregexp/xregexp-all.js'
import UserTeaser from '~/components/UserTeaser/UserTeaser'

export default {
  name: 'FollowerList',
  components: {
    UserTeaser,
  },
  props: {
    user: { type: Object, default: null },
    type: { type: String, default: 'following' },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      filter: null,
    }
  },
  computed: {
    userName() {
      const { name } = this.user || {}
      return name || this.$t('profile.userAnonym')
    },
    allConnectionsCount() {
      return this.user[`${this.type}Count`]
    },
    connections() {
      return this.user[this.type]
    },
    connectionsClass() {
      const overflow = this.connections.length > 7 ? ' --overflow' : ''
      return `connections${overflow}`
    },
    filteredConnections() {
      if (!this.filter) {
        return this.connections
      }

      // @example
      //  this.filter = 'foo';
      //  fuzzyExpression = /([^f]*f)([^o]*o)([^o]*o)/i
      const fuzzyExpression = new RegExp(
        `${this.filter.split('').reduce((expr, c) => `${expr}([^${escape(c)}]*${escape(c)})`, '')}`,
        'i',
      )

      const fuzzyScores = this.connections
        .map((user) => {
          const match = user.name.match(fuzzyExpression)

          if (!match) {
            return false
          }

          let score = 1
          for (let i = 1; i <= this.filter.length; i++) {
            score *= match[i].length
          }

          return {
            user,
            score,
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.score - b.score)

      return fuzzyScores.map((score) => score.user)
    },
  },
  methods: {
    setFilter(evt) {
      this.filter = evt.target.value
    },
  },
}
</script>

<style lang="scss">
.follow-list {
  display: flex;
  flex-direction: column;
  position: relative;
  //max-height: ($size-avatar-small + $space-x-small * 2) * 8;
  width: auto;

  .connections.--overflow {
    height: ($size-avatar-base + $space-x-small * 2) * 5;
    margin-top: -$space-x-small;
    overflow-y: auto;
  }

  .nobody-message {
    text-align: center;
    color: $text-color-soft;
  }

  .spacer-x-small {
    margin: $space-x-small 0;
  }
}
</style>
