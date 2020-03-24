<template>
  <filter-menu-section :divider="false" class="following-filter">
    <template #sidebar>
      <labeled-button
        icon="user-plus"
        :label="$t('filter-menu.following')"
        :filled="filteredByUsersFollowed"
        :title="$t('contribution.filterFollow')"
        @click="toggleFilteredByFollowed(currentUser.id)"
      />
    </template>
  </filter-menu-section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import FilterMenuSection from '~/components/FilterMenu/FilterMenuSection'
import LabeledButton from '~/components/_new/generic/LabeledButton/LabeledButton'

export default {
  components: {
    FilterMenuSection,
    LabeledButton,
  },
  computed: {
    ...mapGetters({
      filteredByUsersFollowed: 'posts/filteredByUsersFollowed',
      currentUser: 'auth/user',
    }),
  },
  methods: {
    ...mapMutations({
      toggleFilteredByFollowed: 'posts/TOGGLE_FILTER_BY_FOLLOWED',
    }),
  },
}
</script>
