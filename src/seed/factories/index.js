import { GraphQLClient, request } from 'graphql-request'
import { getDriver } from '../../bootstrap/neo4j'

export const seedServerHost = 'http://127.0.0.1:4001'

const authenticatedHeaders = async ({ email, password }, host) => {
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  const response = await request(host, mutation)
  return {
    authorization: `Bearer ${response.login.token}`
  }
}

const factories = {
  'badge': require('./badges.js').default,
  'user': require('./users.js').default,
  'organization': require('./organizations.js').default,
  'post': require('./posts.js').default,
  'comment': require('./comments.js').default,
  'category': require('./categories.js').default,
  'tag': require('./tags.js').default,
  'report': require('./reports.js').default
}

const relationFactories = {
  'user': require('./users.js').relate,
  'organization': require('./organizations.js').relate,
  'post': require('./posts.js').relate,
  'comment': require('./comments.js').relate
}

export const create = (model, parameters, options) => {
  const graphQLClient = new GraphQLClient(seedServerHost, options)
  const mutation = factories[model](parameters)
  return graphQLClient.request(mutation)
}

export const relate = (model, type, parameters, options) => {
  const graphQLClient = new GraphQLClient(seedServerHost, options)
  const mutation = relationFactories[model](type, parameters)
  return graphQLClient.request(mutation)
}

export const cleanDatabase = async (options = {}) => {
  const {
    driver = getDriver()
  } = options
  const session = driver.session()
  const cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r'
  try {
    return await session.run(cypher)
  } catch (error) {
    throw (error)
  } finally {
    session.close()
  }
}

export default function Factory (options = {}) {
  const {
    neo4jDriver = getDriver(),
    seedServerHost = 'http://127.0.0.1:4001'
  } = options

  const graphQLClient = new GraphQLClient(seedServerHost)

  const result = {
    neo4jDriver,
    seedServerHost,
    graphQLClient,
    lastResponse: null,
    async authenticateAs ({ email, password }) {
      const headers = await authenticatedHeaders({ email, password }, seedServerHost)
      this.lastResponse = headers
      this.graphQLClient = new GraphQLClient(seedServerHost, { headers })
      return this
    },
    async create (node, properties) {
      const mutation = factories[node](properties)
      this.lastResponse = await this.graphQLClient.request(mutation)
      return this
    },
    async relate (node, relationship, properties) {
      const mutation = relationFactories[node](relationship, properties)
      this.lastResponse = await this.graphQLClient.request(mutation)
      return this
    },
    async cleanDatabase () {
      this.lastResponse = await cleanDatabase({ driver: this.neo4jDriver })
      return this
    }
  }
  result.authenticateAs.bind(result)
  result.create.bind(result)
  result.relate.bind(result)
  result.cleanDatabase.bind(result)
  return result
}
