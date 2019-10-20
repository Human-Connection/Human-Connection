<template>
  <ds-flex :width="{ base: '100%' }" gutter="base">
    <ds-flex-item :width="{ base: '100%', md: 3 }">
      <hc-contribution-form :contribution="contribution" />
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', md: 1 }">&nbsp;</ds-flex-item>
  </ds-flex>
</template>

<script>
import HcContributionForm from '~/components/ContributionForm/ContributionForm'
import PostQuery from '~/graphql/PostQuery'

export default {
  components: {
    HcContributionForm,
  },
  computed: {
    user() {
      return this.$store.getters['auth/user']
    },
    author() {
      return this.contribution ? this.contribution.author : {}
    },
    contribution() {
      return this.Post ? this.Post[0] : {}
    },
  },
  watch: {
    contribution() {
      if (this.author.id !== this.user.id) {
        throw new Error(`You can't edit that!`)
      }
    },
  },
  apollo: {
    Post: {
      query() {
        return PostQuery(this.$i18n)
      },
      variables() {
        return {
          id: this.$route.params.id,
        }
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
