<template>
  <dropdown ref="menu" placement="top-start" :offset="8" class="filter-menu">
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
      <div class="filter-menu-options">
        <h2 class="title">{{ $t('filter-menu.filter-by') }}</h2>
        <following-filter />
        <categories-filter />
        <emotions-filter />
        <languages-filter />
      </div>
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
.filter-menu-options {
  max-width: $size-max-width-filter-menu;
  padding: $space-small $space-x-small;

  > .title {
    font-size: $font-size-large;
  }
}
</style>
