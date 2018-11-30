export default function({ app }) {
  const backendUrl = process.BACKEND_URL || 'http://localhost:4000'
  return {
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
