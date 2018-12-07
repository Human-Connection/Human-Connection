import server from './server'

const serverConfig = {
  port: process.env.GRAPHQL_PORT || 4000
  // cors: {
  //   credentials: true,
  //   origin: [process.env.CLIENT_URI] // your frontend url.
  // }
}

server.start(serverConfig, options => {
  /* eslint-disable-next-line no-console */
  console.log(`Server ready at ${process.env.GRAPHQL_URI} 🚀`)
})
