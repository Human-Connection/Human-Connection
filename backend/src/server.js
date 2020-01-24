import express from 'express'
import http from 'http'
import helmet from 'helmet'
import { ApolloServer } from 'apollo-server-express'


import CONFIG from './config'
import middleware from './middleware'
import { getNeode, getDriver } from './db/neo4j'
import decode from './jwt/decode'
import schema from './schema'
import webfinger from './activitypub/routes/webfinger'


const driver = getDriver()
const neode = getNeode()

const getContext = async (req) => {
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
export const context = async (options) => {
  const { connection, req } = options
  if (connection) {
    return connection.context
  } else {
    return getContext(req)
  }
}

const createServer = options => {
  const defaults = {
    context,
    schema: middleware(schema),
    subscriptions: {
      onConnect: (connectionParams, webSocket) => {
        return getContext(connectionParams)
      },
    },
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
  server.applyMiddleware({ app, path: '/' })
  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);


  return { server, httpServer, app }
}

export default createServer
