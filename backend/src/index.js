import createServer from './server'
import initService from './activitypub/ActivityPub'

const serverConfig = {
  port: process.env.GRAPHQL_PORT || 4000
  // cors: {
  //   credentials: true,
  //   origin: [process.env.CLIENT_URI] // your frontend url.
  // }
}

const server = createServer()
server.start(serverConfig, options => {
  /* eslint-disable-next-line no-console */
  console.log(`GraphQLServer ready at ${process.env.GRAPHQL_URI} 🚀`)
  initService(server)
})
