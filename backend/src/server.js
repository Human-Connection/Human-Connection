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
import helmet from 'helmet'
import decode from './jwt/decode'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config()
// check env and warn
const requiredEnvVars = ['MAPBOX_TOKEN', 'JWT_SECRET', 'PRIVATE_KEY_PASSPHRASE']
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
      exclude: ['Notfication', 'Statistics', 'LoggedInUser']
    },
    mutation: {
      exclude: ['Notfication', 'Statistics', 'LoggedInUser']
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
        req: request,
        cypherParams: {
          currentUserId: user ? user.id : null
        }
      }
    },
    schema: schema,
    debug: debug,
    tracing: debug,
    middlewares: middleware(schema),
    mocks: (process.env.MOCK === 'true') ? mocks : false
  }
  const server = new GraphQLServer(Object.assign({}, defaults, options))

  const corsOptions = {
    credentials: true,
    origin: 'http://localhost:5000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

  server.express.use(cors())
  server.express.use(cookieParser())

  server.express.get('/rocket_chat_auth_get', cors(corsOptions), async (req, res) => {
    const token = req.cookies['human-connection-token']
    res.send({ token })
  })

  server.express.use(helmet())
  server.express.use(express.static('public'))
  return server
}

export default createServer
