import createServer from './server'
import ActivityPub from './activitypub/ActivityPub'
import CONFIG from './config'

const serverConfig = {
  port: CONFIG.GRAPHQL_PORT,
  // cors: {
  //   credentials: true,
  //   origin: [CONFIG.CLIENT_URI] // your frontend url.
  // }
}

const server = createServer()
server.start(serverConfig, options => {
  /* eslint-disable-next-line no-console */
  console.log(`GraphQLServer ready at ${CONFIG.GRAPHQL_URI} 🚀`)
  ActivityPub.init(server)
})
