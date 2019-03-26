export default function(options = {}) {
  const { queryId, querySlug, path, message = 'Page not found.' } = options
  return {
    asyncData: async context => {
      const {
        params: { id, slug },
        redirect,
        error,
        app: { apolloProvider }
      } = context
      const idOrSlug = id || slug

      const variables = { idOrSlug }
      const client = apolloProvider.defaultClient

      let response
      let thing
      response = await client.query({ query: queryId, variables })
      thing = response.data[Object.keys(response.data)[0]][0]
      if (thing && thing.slug === slug) return // all good
      if (thing && thing.slug !== slug) {
        return redirect(`/${path}/${thing.id}/${thing.slug}`)
      }

      response = await client.query({ query: querySlug, variables })
      thing = response.data[Object.keys(response.data)[0]][0]
      if (thing) return redirect(`/${path}/${thing.id}/${thing.slug}`)

      return error({ statusCode: 404, message })
    }
  }
}
