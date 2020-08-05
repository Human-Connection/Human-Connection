<template>
  <div>
    <ds-flex gutter="small">
      <ds-flex-item :width="{ base: '100%', sm: 2, md: 2, lg: 1 }">
        <transition name="slide-up" appear>
          <nuxt-child />
        </transition>
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import PersistentLinks from '~/mixins/persistentLinks.js'

const options = {
  queryId: gql`
    query($idOrSlug: ID) {
      Organization(id: $idOrSlug) {
        id
        slug
      }
    }
  `,
  querySlug: gql`
    query($idOrSlug: String) {
      Organization(slug: $idOrSlug) {
        id
        slug
      }
    }
  `,
  path: 'organization',
  message: 'error-pages.organization-not-found',
}
const persistentLinks = PersistentLinks(options)

export default {
  mixins: [persistentLinks],
  computed: {
    routes() {
      const { slug, id } = this.$route.params
      return [
        {
          name: this.$t('common.organization', null, 1),
          path: `/organization/${id}/${slug}`,
        },
      ]
    },
  },
}
</script>
