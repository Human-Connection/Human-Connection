import { GraphQLServer } from 'graphql-yoga'
import { makeExecutableSchema } from 'apollo-server'
import { augmentSchema } from 'neo4j-graphql-js'
import { typeDefs, resolvers } from './graphql-schema'
import { v1 as neo4j } from 'neo4j-driver'
import dotenv from 'dotenv'
import mocks from './mocks'
import middleware from './middleware'

import passport from 'passport'
import jwtStrategy from './jwt/strategy'
import jwt from 'jsonwebtoken'

// import {
//   GraphQLLowerCaseDirective,
//   GraphQLTrimDirective,
//   GraphQLDefaultToDirective
// } from 'graphql-custom-directives';

dotenv.config()

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// augmentSchema will add auto generated mutations based on types in schema
// const augmentedSchema = augmentSchema(schema)

// add custom directives
// const directives = [
//   GraphQLLowerCaseDirective,
//   GraphQLTrimDirective,
//   GraphQLDefaultToDirective
// ]
// augmentedSchema._directives.push.apply(augmentedSchema._directives, directives)

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  )
)

const MOCK = (process.env.MOCK === 'true')
console.log('MOCK:', MOCK)

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
  schema: augmentSchema(schema),
  // TODO: switch to the part below when neo4j-graphql-js 1.0.5 or higher is available
  // schema: augmentSchema(schema, {
  //   query: {
  //     exclude: ['Statistics']
  //   },
  //   mutation: {
  //     exclude: ['Statistics']
  //   }
  // }),
  tracing: true,
  middlewares: middleware,
  mocks: MOCK ? mocks : false
})

passport.use('jwt', jwtStrategy())
server.express.use(passport.initialize())

server.express.post('/graphql', passport.authenticate(['jwt'], { session: false }))

// session middleware
// server.express.use(session({
//   name: 'qid',
//   secret: process.env.JWT_SECRET,
//   resave: true,
//   saveUninitialized: true,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: ms('1d')
//   }
// }))

const serverConfig = {
  port: 4000
  // cors: {
  //   credentials: true,
  //   origin: [process.env.CLIENT_URI] // your frontend url.
  // }
}

server.start(serverConfig, options =>  {
  console.log(`Server ready at ${process.env.GRAPHQL_URI} 🚀`);
})
