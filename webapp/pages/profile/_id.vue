<template>
  <nuxt-child />
</template>

<script>
import gql from 'graphql-tag'
import PersistentLinks from '~/mixins/persistentLinks.js'

const options = {
  queryId: gql`
    query($idOrSlug: ID) {
      User(id: $idOrSlug) {
        id
        slug
      }
    }
  `,
  querySlug: gql`
    query($idOrSlug: String) {
      User(slug: $idOrSlug) {
        id
        slug
      }
    }
  `,
  message: 'This user could not be found',
  path: 'profile'
}
const persistentLinks = PersistentLinks(options)

export default {
  mixins: [persistentLinks]
}
</script>
