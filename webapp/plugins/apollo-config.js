import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import introspectionQueryResultData from './apollo-config/fragmentTypes.json'

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
})

export default ({ app }) => {
  const backendUrl = process.env.GRAPHQL_URI || 'http://localhost:4000'

  return {
    wsEndpoint: process.env.WEBSOCKETS_URI || 'ws://localhost:4000/graphql',
    httpEndpoint: process.server ? backendUrl : '/api',
    httpLinkOptions: {
      credentials: 'same-origin',
    },
    credentials: true,
    tokenName: 'human-connection-token',
    persisting: false,
    websocketsOnly: false,
    cache: new InMemoryCache({ fragmentMatcher }),
  }
}
