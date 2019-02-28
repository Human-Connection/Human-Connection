import { GraphQLClient, request } from 'graphql-request'
import { getDriver } from '../../bootstrap/neo4j'
import createBadge from './badges.js'
import createUser from './users.js'
import createOrganization from './organizations.js'
import createPost from './posts.js'
import createComment from './comments.js'
import createCategory from './categories.js'
import createTag from './tags.js'
import createReport from './reports.js'

export const seedServerHost = 'http://127.0.0.1:4001'

const authenticatedHeaders = async ({ email, password }, host) => {
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}")
      }`
  const response = await request(host, mutation)
  return {
    authorization: `Bearer ${response.login}`
  }
}
const factories = {
  Badge: createBadge,
  User: createUser,
  Organization: createOrganization,
  Post: createPost,
  Comment: createComment,
  Category: createCategory,
  Tag: createTag,
  Report: createReport
}

export const cleanDatabase = async (options = {}) => {
  const { driver = getDriver() } = options
  const session = driver.session()
  const cypher = 'MATCH (n) DETACH DELETE n'
  try {
    return await session.run(cypher)
  } catch (error) {
    throw error
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
    factories,
    lastResponse: null,
    async authenticateAs ({ email, password }) {
      const headers = await authenticatedHeaders(
        { email, password },
        seedServerHost
      )
      this.lastResponse = headers
      this.graphQLClient = new GraphQLClient(seedServerHost, { headers })
      return this
    },
    async create (node, properties) {
      const mutation = this.factories[node](properties)
      this.lastResponse = await this.graphQLClient.request(mutation)
      return this
    },
    async relate (node, relationship, properties) {
      const { from, to } = properties
      const mutation = `
        mutation {
          Add${node}${relationship}(
            from: { id: "${from}" },
            to: { id: "${to}" }
          ) { from { id } }
        }
      `
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
