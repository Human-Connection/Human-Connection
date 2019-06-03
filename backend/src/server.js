import express from 'express'
import helmet from 'helmet'
import { GraphQLServer } from 'graphql-yoga'
import CONFIG from './config'
import mocks from './mocks'
import middleware from './middleware'
import { getDriver } from './bootstrap/neo4j'
import decode from './jwt/decode'
import schema from './schema'

// check required configs and throw error
Object.entries(CONFIG.requiredConfigs).map(entry => {
  if (!entry[1]) {
    throw new Error(`ERROR: "${entry[0]}" env variable is missing.`)
  }
})

const driver = getDriver()

const createServer = options => {
  const defaults = {
    context: async ({ request }) => {
      const user = await decode(driver, request.headers.authorization)
      return {
        driver,
        user,
        req: request,
        cypherParams: {
          currentUserId: user ? user.id : null,
        },
      }
    },
    schema,
    debug: CONFIG.DEBUG,
    tracing: CONFIG.DEBUG,
    middlewares: middleware(schema),
    mocks: CONFIG.MOCKS ? mocks : false,
  }
  const server = new GraphQLServer(Object.assign({}, defaults, options))

  server.express.use(helmet())
  server.express.use(express.static('public'))
  return server
}

export default createServer
