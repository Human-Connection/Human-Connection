import { createUploadLink } from 'apollo-upload-client'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'

export default ({ app }) => {
  const backendUrl = process.env.GRAPHQL_URI || 'http://localhost:4000'
  const link = createUploadLink({ uri: 'http://localhost:4000' })
  
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })

  console.log(client)
  return {
    client,
    httpEndpoint: process.server ? backendUrl : '/api',
    httpLinkOptions: {
      credentials: 'same-origin'
    },
    credentials: true,
    tokenName: 'human-connection-token',
    persisting: false,
    websocketsOnly: false
  }
}
