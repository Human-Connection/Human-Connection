import express from 'express'
import helmet from 'helmet'
import { ApolloServer } from 'apollo-server-express'
import CONFIG from './config'
import middleware from './middleware'
import { getNeode, getDriver } from './db/neo4j'
import decode from './jwt/decode'
import schema from './schema'
import webfinger from './activitypub/routes/webfinger'
import bodyParser from 'body-parser'

const driver = getDriver()
const neode = getNeode()

export const context = async ({ req }) => {
  const user = await decode(driver, req.headers.authorization)
  return {
    driver,
    neode,
    user,
    req,
    cypherParams: {
      currentUserId: user ? user.id : null,
    },
  }
}

const createServer = options => {
  const defaults = {
    context,
    schema: middleware(schema),
    debug: !!CONFIG.DEBUG,
    tracing: !!CONFIG.DEBUG,
    formatError: error => {
      if (error.message === 'ERROR_VALIDATION') {
        return new Error(error.originalError.details.map(d => d.message))
      }
      return error
    },
  }
  const server = new ApolloServer(Object.assign({}, defaults, options))

  const app = express()

  app.set('driver', driver)
  app.use(helmet())
  app.use('/.well-known/', webfinger())
  app.use(express.static('public'))
  app.use(bodyParser.json({ limit: '10mb' }))
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
  server.applyMiddleware({ app, path: '/' })

  return { server, app }
}

export default createServer
