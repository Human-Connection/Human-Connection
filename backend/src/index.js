import createServer from './server'
import CONFIG from './config'

const { app } = createServer()
app.listen({ port: CONFIG.GRAPHQL_PORT }, () => {
  /* eslint-disable-next-line no-console */
  console.log(`GraphQLServer ready at ${CONFIG.GRAPHQL_URI} 🚀`)
})
