<template>
  <dropdown ref="menu" :placement="placement" :offset="offset">
    <ds-button
      slot="default"
      icon="filter"
      name="filter"
      :primary="filterActive"
      :ghost="!filterActive"
      slot-scope="{ toggleMenu }"
      @click.prevent="toggleMenu()"
    />
    <template slot="popover">
      <ds-container>
        <categories-filter-menu-items :chunk="chunk" />
        <general-filter-menu-items :user="currentUser" />
      </ds-container>
    </template>
  </dropdown>
</template>
<script>
import { chunk } from 'lodash'
import Dropdown from '~/components/Dropdown'
import { mapGetters } from 'vuex'
import CategoriesFilterMenuItems from './CategoriesFilterMenuItems'
import GeneralFilterMenuItems from './GeneralFilterMenuItems'

export default {
  components: {
    Dropdown,
    CategoriesFilterMenuItems,
    GeneralFilterMenuItems,
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
      return chunk(this.categories, 2)
    },
  },
}
</script>
