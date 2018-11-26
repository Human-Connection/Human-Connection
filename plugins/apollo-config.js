export default function({ app }) {
  return {
    httpEndpoint: '/api',
    httpLinkOptions: {
      credentials: 'same-origin'
    },
    credentials: true,
    tokenName: 'apollo-token',
    persisting: false,
    websocketsOnly: false
  }
}
