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
      <ds-container>
        <categories-filter-menu-items :chunk="chunk" />
        <follows-filter-menu-items :user="currentUser" />
      </ds-container>
    </template>
  </dropdown>
</template>
<script>
import _ from 'lodash'
import Dropdown from '~/components/Dropdown'
import { mapGetters } from 'vuex'
import CategoriesFilterMenuItems from './CategoriesFilterMenuItems'
import FollowsFilterMenuItems from './FollowsFilterMenuItems'

export default {
  components: {
    Dropdown,
    CategoriesFilterMenuItems,
    FollowsFilterMenuItems,
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
