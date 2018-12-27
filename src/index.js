const { ApolloServer, gql } = require('apollo-server')
const scraper = require('./scraper.js')
const typeDefs = require('./graphql-schema.js')

const resolvers = {
  Query: {
    async embed(obj, {url}, ctx, info) {
      return await scraper.fetch(url)
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen({ port: 3050 }).then(({ url }) => {
  console.log(`🚀 Nitro Embed - Server is ready at ${url}`)
})
