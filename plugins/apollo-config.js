export default function({ app }) {
  const backendUrl = app.$env.BACKEND_URL || 'http://localhost:4000'
  return {
    httpEndpoint: backendUrl,
    httpLinkOptions: {
      credentials: 'same-origin'
    },
    credentials: true,
    tokenName: 'apollo-token',
    persisting: false,
    websocketsOnly: false
  }
}
