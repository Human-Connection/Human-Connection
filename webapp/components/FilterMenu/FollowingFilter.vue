<template>
  <section class="following-filter">
    <labeled-button
      :filled="filteredByUsersFollowed"
      icon="user-plus"
      :label="$t('filter-menu.following')"
      @click="toggleFilteredByFollowed(currentUser.id)"
      v-tooltip="{
        content: this.$t('contribution.filterFollow'),
        placement: 'left',
        delay: { show: 500 },
      }"
    />
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import LabeledButton from '~/components/_new/generic/LabeledButton/LabeledButton'

export default {
  components: {
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
<style lang="scss">
.following-filter {
  display: flex;
  flex-wrap: wrap;
  margin-top: $space-small;

  > .labeled-button {
    margin-top: $space-small;
    width: 5%;
  }

  @media only screen and (max-width: 960px) {
    .labeled-button {
      width: 100%;
    }
  }
}
</style>
