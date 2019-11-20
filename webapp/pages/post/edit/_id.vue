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
import { mapGetters } from 'vuex'

export default {
  components: {
    HcContributionForm,
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
  },
  async asyncData(context) {
    const {
      app,
      store,
      error,
      params: { id },
    } = context
    const client = app.apolloProvider.defaultClient
    const {
      data: {
        Post: [contribution],
      },
    } = await client.query({
      query: PostQuery(app.$i18n),
      variables: { id },
    })
    if (contribution.author.id !== store.getters['auth/user'].id) {
      error({ statusCode: 403, message: "You can't edit that!" })
    }
    return { contribution }
  },
}
</script>
