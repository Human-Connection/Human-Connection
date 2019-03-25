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
  layout: 'blank',
  async asyncData(context) {
    const {
      params: { id: idOrSlug },
      redirect,
      error,
      app: { apolloProvider }
    } = context

    const variables = { idOrSlug }
    const client = apolloProvider.defaultClient

    const tryToRedirect = async query => {
      const idRes = await client.query({ query, variables })
      const user = idRes.data.User[0]
      if (user) redirect(`/profile/${user.id}/${user.slug}`)
    }

    await tryToRedirect(queryId)
    await tryToRedirect(querySlug)

    return error({ statusCode: 404 })
  }
}
</script>
