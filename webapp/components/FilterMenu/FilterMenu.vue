<template>
  <ds-card>
    <ds-flex>
      <ds-flex-item class="filter-menu-title">
        <ds-heading size="h3">
          {{ $t('filter-menu.title') }}
        </ds-heading>
      </ds-flex-item>
      <ds-flex-item>
        <div class="filter-menu-buttons">
          <ds-button
            name="filter-by-followed-authors-only"
            icon="user-plus"
            :primary="!!filterAuthorIsFollowedById"
            @click="toggleOnlyFollowed"
          />
        </div>
      </ds-flex-item>
    </ds-flex>
  </ds-card>
</template>

<script>
export default {
  props: {
    user: { type: Object, required: true },
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
  },
}
</script>

<style lang="scss">
.filter-menu-title {
  display: flex;
  align-items: center;
}

.filter-menu-buttons {
  float: right;
}
</style>
