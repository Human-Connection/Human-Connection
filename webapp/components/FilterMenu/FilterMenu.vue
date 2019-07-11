<template>
  <ds-card class="filter-menu-card">
    <ds-flex>
      <ds-flex-item class="filter-menu-title">
        <ds-heading size="h3">{{ $t('filter-menu.title') }}</ds-heading>
      </ds-flex-item>

      <ds-flex-item>
        <div class="filter-menu-buttons">
          <ds-button
            v-tooltip="{
              content: this.$t('contribution.filterFollow'),
              delay: { show: 500 },
            }"
            name="filter-by-followed-authors-only"
            icon="filter"
            :primary="!!filterAuthorIsFollowedById"
            @click="toggleOnlyFollowed"
          />
        </div>
      </ds-flex-item>
    </ds-flex>
    <div v-if="hashtag">
      <ds-space margin-bottom="x-small" />
      <ds-flex>
        <ds-flex-item>
          <ds-heading size="h3">{{ $t('filter-menu.hashtag-search', { hashtag }) }}</ds-heading>
        </ds-flex-item>
        <ds-flex-item>
          <div class="filter-menu-buttons">
            <ds-button
              v-tooltip="{
                content: this.$t('filter-menu.clearSearch'),
                placement: 'left',
                delay: { show: 500 },
              }"
              name="filter-by-followed-authors-only"
              icon="close"
              @click="clearSearch"
            />
          </div>
        </ds-flex-item>
      </ds-flex>
    </div>
  </ds-card>
</template>

<script>
export default {
  props: {
    user: { type: Object, required: true },
    hashtag: { type: Object, default: null },
  },
  data() {
    return {
      filter: {},
    }
  },
  computed: {
    filterAuthorIsFollowedById() {
      const { author = {} } = this.filter
      /* eslint-disable camelcase */
      const { followedBy_some = {} } = author
      const { id } = followedBy_some
      /* eslint-enable */
      return id
    },
  },
  methods: {
    toggleOnlyFollowed() {
      this.filter = this.filterAuthorIsFollowedById
        ? {}
        : { author: { followedBy_some: { id: this.user.id } } }
      this.$emit('changeFilterBubble', this.filter)
    },
    clearSearch() {
      this.$emit('clearSearch')
    },
  },
}
</script>

<style lang="scss">
.filter-menu-card {
  background-color: $background-color-soft;
}

.filter-menu-title {
  display: flex;
  align-items: center;
}

.filter-menu-buttons {
  float: right;
}
</style>
