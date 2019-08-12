<template>
  <dropdown ref="menu" :placement="placement" :offset="offset">
    <a slot="default" slot-scope="{ toggleMenu }" href="#" @click.prevent="toggleMenu()">
      <ds-icon style="margin: 12px 0px 0px 10px;" name="filter" size="large" />
      <ds-icon style="margin: 7px 0px 0px 2px" size="xx-small" name="angle-down" />
    </a>
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
    }),
    chunk() {
      return _.chunk(this.categories, 2)
    },
  },
}
</script>
