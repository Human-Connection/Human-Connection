<template>
  <base-card class="follow-list">
    <ds-space v-if="connections && connections.length" margin="x-small">
      <ds-text tag="h5" color="soft">
        {{ userName | truncate(15) }} {{ $t(`profile.network.${type}`) }}
      </ds-text>
    </ds-space>
    <template v-else>
      <p class="no-connections">{{ userName }} {{ $t(`profile.network.${type}Nobody`) }}</p>
    </template>
    <template v-if="connections && connections.length <= 7">
      <ds-space v-for="connection in connections" :key="connection.id" margin="x-small">
        <!-- TODO: find better solution for rendering errors -->
        <client-only>
          <user-teaser :user="connection" />
        </client-only>
      </ds-space>
      <ds-space v-if="allConnectionsCount - connections.length" margin="small">
        <base-button
          @click="$emit('fetchAllConnections', type)"
          :loading="loading"
          size="small"
          color="softer"
        >
          {{
            $t('profile.network.andMore', {
              number: allConnectionsCount - connections.length,
            })
          }}
        </base-button>
      </ds-space>
    </template>
    <template v-else-if="connections.length > 7">
      <div class="overflow-container">
        <ds-space v-for="connection in filteredConnections" :key="connection.id" margin="x-small">
          <client-only>
            <user-teaser :user="connection" />
          </client-only>
        </ds-space>
      </div>
      <ds-space margin="x-small">
        <ds-input
          @input.native="setFilter"
          :placeholder="filter"
          v-focus="true"
          size="small"
          icon="filter"
          :name="`${type}Filter`"
        />
      </ds-space>
    </template>
  </base-card>
</template>

<script>
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
  position: relative;
  max-height: 424px;
  width: auto;

  > .no-connections {
    text-align: center;
    color: $text-color-soft;
  }

  > .overflow-container {
    height: $size-avatar-base * 7;
    margin-top: -8px;
    overflow-y: auto;
  }
}
</style>
