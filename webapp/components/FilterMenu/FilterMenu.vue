<template>
  <dropdown ref="menu" :placement="placement" :offset="offset">
    <base-button
      slot="default"
      icon="filter"
      :filled="filterActive"
      :ghost="!filterActive"
      slot-scope="{ toggleMenu }"
      @click.prevent="toggleMenu()"
    >
      <base-icon class="dropdown-arrow" name="angle-down" />
    </base-button>
    <template slot="popover">
      <ds-container>
        <h4 class="title">{{ $t('filter-menu.filter-by') }}</h4>
        <following-filter />
        <categories-filter />
        <general-filter />
        <language-filter />
      </ds-container>
    </template>
  </dropdown>
</template>
<script>
import Dropdown from '~/components/Dropdown'
import { mapGetters } from 'vuex'
import FollowingFilter from './FollowingFilter'
import CategoriesFilter from './CategoriesFilter'
import GeneralFilter from './GeneralFilter'
import LanguageFilter from './LanguageFilter'

export default {
  components: {
    Dropdown,
    FollowingFilter,
    CategoriesFilter,
    GeneralFilter,
    LanguageFilter,
  },
  props: {
    placement: { type: String },
    offset: { type: [String, Number] },
  },
  computed: {
    ...mapGetters({
      filterActive: 'posts/isActive',
    }),
  },
}
</script>
