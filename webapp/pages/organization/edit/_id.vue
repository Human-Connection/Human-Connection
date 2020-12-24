<template>
  <ds-flex :width="{ base: '100%' }" gutter="base">
    <ds-flex-item :width="{ base: '100%', md: 3 }">
      <organization-form :organization="organization" />
    </ds-flex-item>
    <ds-flex-item :width="{ base: '100%', md: 1 }">&nbsp;</ds-flex-item>
  </ds-flex>
</template>

<script>
import OrganizationForm from '~/components/OrganizationForm/OrganizationForm'
import OrganizationQuery from '~/graphql/OrganizationQuery'
import { mapGetters } from 'vuex'

export default {
  components: {
    OrganizationForm,
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
      isAdmin: 'auth/isAdmin',
      isModrator: 'auth/isModerator',
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
        Organization: [organization],
      },
    } = await client.query({
      query: OrganizationQuery(app.$i18n),
      variables: { id },
    })
    if (
      !(
        store.getters['auth/isAdmin'] ||
        store.getters['auth/isModerator'] ||
        organization.creator.id === store.getters['auth/user'].id
      )
    ) {
      error({ statusCode: 403, message: 'error-pages.cannot-edit-organization' })
    }
    return { organization }
  },
}
</script>
