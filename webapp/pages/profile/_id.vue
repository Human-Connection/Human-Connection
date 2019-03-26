<template>
  <nuxt-child />
</template>

<script>
import gql from 'graphql-tag'

const queryId = gql`
  query($idOrSlug: ID) {
    User(id: $idOrSlug) {
      id
      slug
    }
  }
`
const querySlug = gql`
  query($idOrSlug: String) {
    User(slug: $idOrSlug) {
      id
      slug
    }
  }
`

export default {
  async asyncData(context) {
    const {
      params: { id, slug },
      redirect,
      error,
      app: { apolloProvider }
    } = context
    const idOrSlug = id

    const variables = { idOrSlug }
    const client = apolloProvider.defaultClient

    let response
    let user
    response = await client.query({ query: queryId, variables })
    user = response.data.User[0]
    if (user && user.slug === slug) return // all good
    if (user && user.slug !== slug) {
      return redirect(`/profile/${user.id}/${user.slug}`)
    }

    response = await client.query({ query: querySlug, variables })
    user = response.data.User[0]
    if (user) return redirect(`/profile/${user.id}/${user.slug}`)

    const message = 'This user could not be found'
    return error({ statusCode: 404, message })
  }
}
</script>
