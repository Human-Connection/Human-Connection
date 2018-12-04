import { GraphQLServer } from 'graphql-yoga'
import { makeExecutableSchema } from 'apollo-server'
import { augmentSchema } from 'neo4j-graphql-js'
import { typeDefs, resolvers } from './graphql-schema'
import dotenv from 'dotenv'
import mocks from './mocks'
import middleware from './middleware'
import applyDirectives from './bootstrap/directives'
import applyScalars from './bootstrap/scalars'
import neo4j from './bootstrap/neo4j'

import passport from 'passport'
import jwtStrategy from './jwt/strategy'
import jwt from 'jsonwebtoken'

dotenv.config()

let schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

const driver = neo4j().getDriver()

const MOCK = (process.env.MOCK === 'true')
console.log('MOCK:', MOCK)

schema = augmentSchema(schema, {
  query: {
    exclude: ['Statistics', 'LoggedInUser']
  },
  mutation: {
    exclude: ['Statistics', 'LoggedInUser']
  }
})
schema = applyScalars(applyDirectives(schema))

const server = new GraphQLServer({
  context: async (req) => {
    const payload = {
      driver,
      user: null,
      req: req.request
    }
    try {
      const token = payload.req.headers.authorization.replace('Bearer ', '')
      payload.user = await jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {}

    return payload
  },
  schema: schema,
  tracing: true,
  middlewares: middleware(schema),
  mocks: MOCK ? mocks : false
})

passport.use('jwt', jwtStrategy())
server.express.use(passport.initialize())

server.express.post('/graphql', passport.authenticate(['jwt'], { session: false }))

const serverConfig = {
  port: process.env.GRAPHQL_PORT || 4000
  // cors: {
  //   credentials: true,
  //   origin: [process.env.CLIENT_URI] // your frontend url.
  // }
}

server.start(serverConfig, options => {
  console.log(`Server ready at ${process.env.GRAPHQL_URI} 🚀`)
})
