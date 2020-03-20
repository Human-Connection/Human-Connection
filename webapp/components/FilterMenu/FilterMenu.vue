<template>
  <dropdown ref="menu" :placement="placement" :offset="offset" class="filter-menu">
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
      <ds-container class="filter-menu-options">
        <h4 class="title">{{ $t('filter-menu.filter-by') }}</h4>
        <following-filter />
        <categories-filter />
        <emotions-filter />
        <languages-filter />
      </ds-container>
    </template>
  </dropdown>
</template>
<script>
import Dropdown from '~/components/Dropdown'
import { mapGetters } from 'vuex'
import FollowingFilter from './FollowingFilter'
import CategoriesFilter from './CategoriesFilter'
import EmotionsFilter from './EmotionsFilter'
import LanguagesFilter from './LanguagesFilter'

export default {
  components: {
    Dropdown,
    FollowingFilter,
    CategoriesFilter,
    EmotionsFilter,
    LanguagesFilter,
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
<style lang="scss">
@media only screen and (max-width: 960px) {
  .filter-menu-options {
    > .title {
      text-align: center;
    }
  }
}
</style>
