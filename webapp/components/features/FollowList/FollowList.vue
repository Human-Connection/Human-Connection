<template>
  <base-card class="follow-list">
    <template v-if="connections && connections.length">
      <h5 class="title spacer-x-small">
        {{ userName | truncate(15) }} {{ $t(`profile.network.${type}`) }}
      </h5>
      <ul :class="connectionsClass">
        <li
          v-for="connection in filteredConnections"
          :key="connection.id"
          class="connections__item"
        >
          <user-teaser :user="connection" />
        </li>
      </ul>
      <base-button
        v-if="hasMore"
        :loading="loading"
        class="spacer-x-small"
        size="small"
        @click="$emit('fetchAllConnections', type)"
      >
        {{
          $t('profile.network.andMore', {
            number: allConnectionsCount - connections.length,
          })
        }}
      </base-button>
      <ds-input
        v-if="!hasMore"
        v-focus="true"
        :name="`${type}Filter`"
        :placeholder="filter"
        class="spacer-x-small"
        icon="filter"
        size="small"
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
    hasMore() {
      return this.allConnectionsCount > this.connections.length
    },
    connectionsClass() {
      return `connections${this.hasMore ? '' : ' --overflow'}`
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
  width: auto;

  > .title {
    color: $text-color-soft;
    font-size: $font-size-base;
  }

  .connections {
    height: $size-height-connections;
    padding: $space-none;
    list-style-type: none;

    &.--overflow {
      overflow-y: auto;
    }

    > .connections__item {
      padding: $space-xx-small;

      &.is-selected,
      &:hover {
        background-color: $background-color-primary-inverse;
      }
    }
  }

  .nobody-message {
    text-align: center;
    color: $text-color-soft;
  }

  > :nth-child(n):not(:last-child) {
    margin-bottom: $space-small;
  }
}
</style>
