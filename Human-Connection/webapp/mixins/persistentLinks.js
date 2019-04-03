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
      let resource
      response = await client.query({ query: queryId, variables })
      resource = response.data[Object.keys(response.data)[0]][0]
      if (resource && resource.slug === slug) return // all good
      if (resource && resource.slug !== slug) {
        return redirect(`/${path}/${resource.id}/${resource.slug}`)
      }

      response = await client.query({ query: querySlug, variables })
      resource = response.data[Object.keys(response.data)[0]][0]
      if (resource) return redirect(`/${path}/${resource.id}/${resource.slug}`)

      return error({ statusCode: 404, message })
    }
  }
}
