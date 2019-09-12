<template>
  <dropdown ref="menu" :placement="placement" :offset="offset">
    <ds-button
      slot="default"
      icon="filter"
      :primary="filterActive"
      :ghost="!filterActive"
      slot-scope="{ toggleMenu }"
      @click.prevent="toggleMenu()"
    >
      <ds-icon size="xx-small" name="angle-down" />
    </ds-button>
    <template slot="popover">
      <filter-posts-menu-items :chunk="chunk" :user="currentUser" />
    </template>
  </dropdown>
</template>
<script>
import _ from 'lodash'
import Dropdown from '~/components/Dropdown'
import { mapGetters } from 'vuex'
import FilterPostsMenuItems from '~/components/FilterPosts/FilterPostsMenuItems'

export default {
  components: {
    Dropdown,
    FilterPostsMenuItems,
  },
  props: {
    placement: { type: String },
    offset: { type: [String, Number] },
    categories: { type: Array, default: () => [] },
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      filterActive: 'postsFilter/isActive',
    }),
    chunk() {
      return _.chunk(this.categories, 2)
    },
  },
}
</script>
