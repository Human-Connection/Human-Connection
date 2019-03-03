import { GraphQLServer } from 'graphql-yoga'
import { makeAugmentedSchema } from 'neo4j-graphql-js'
import { typeDefs, resolvers } from './graphql-schema'
import express from 'express'
import dotenv from 'dotenv'
import mocks from './mocks'
import middleware from './middleware'
import applyDirectives from './bootstrap/directives'
import applyScalars from './bootstrap/scalars'
import { getDriver } from './bootstrap/neo4j'
import decode from './jwt/decode'

dotenv.config()
// check env and warn
const requiredEnvVars = ['MAPBOX_TOKEN', 'JWT_SECRET']
requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    throw new Error(`ERROR: "${env}" env variable is missing.`)
  }
})

const driver = getDriver()
const debug = process.env.NODE_ENV !== 'production' && process.env.DEBUG === 'true'

let schema = makeAugmentedSchema({
  typeDefs,
  resolvers,
  config: {
    query: {
      exclude: ['Statistics', 'LoggedInUser']
    },
    mutation: {
      exclude: ['Statistics', 'LoggedInUser']
    },
    debug: debug
  }
})
schema = applyScalars(applyDirectives(schema))

const createServer = (options) => {
  const defaults = {
    context: async ({ request }) => {
      const authorizationHeader = request.headers.authorization || ''
      const user = await decode(driver, authorizationHeader)
      return {
        driver,
        user,
        req: request
      }
    },
    schema: schema,
    debug: debug,
    tracing: debug,
    middlewares: middleware(schema),
    mocks: (process.env.MOCK === 'true') ? mocks : false
  }
  const server = new GraphQLServer(Object.assign({}, defaults, options))

  server.express.use(express.static('public'))
  return server
}

export default createServer
