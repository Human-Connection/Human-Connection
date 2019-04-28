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

  server.express.get('/rocket_chat_auth_get', cors(corsOptions), async (req, res) => {
		console.log('/rocket_chat_auth_get')
		console.log(req)
		res.json({ token: 'abcd' })
		// const authorizationHeader = req.headers.authorization || ''
		// const loginToken = authorizationHeader.replace('Bearer ', '')
		// console.log('/rocket_chat_auth_get', loginToken)
    // const user = await decode(driver, loginToken)
    // if (user) {
		// 	console.log('loginToken', loginToken)
    //   res.send({ loginToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsIm5hbWUiOiJKZW5ueSBSb3N0b2NrIiwiZGlzYWJsZWQiOmZhbHNlLCJhdmF0YXIiOiJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vdWlmYWNlcy9mYWNlcy90d2l0dGVyL2Nhc3BlcmdybC8xMjguanBnIiwiaWQiOiJ1MyIsImVtYWlsIjoidXNlckBleGFtcGxlLm9yZyIsInNsdWciOiJqZW5ueS1yb3N0b2NrIiwiaWF0IjoxNTU2NDQ0OTEyLCJleHAiOjE2NDI4NDQ5MTIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwMCIsInN1YiI6InUzIn0.rREoLrkaAd3OlDl9Ia4lhGIDwale8Or0Tgq-J5RWjkM' })
    // } else {
    //   res.status(401).json({ message: 'User not logged in' })
    // }
  })

  server.express.use(helmet())
  server.express.use(express.static('public'))
  return server
}

export default createServer
