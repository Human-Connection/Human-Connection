import { GraphQLClient, request } from 'graphql-request'
import { getDriver, neode } from '../../bootstrap/neo4j'
import createBadge from './badges.js'
import createUser from './users.js'
import createOrganization from './organizations.js'
import createPost from './posts.js'
import createComment from './comments.js'
import createCategory from './categories.js'
import createTag from './tags.js'
import createReport from './reports.js'
import createNotification from './notifications.js'

export const seedServerHost = 'http://127.0.0.1:4001'

const authenticatedHeaders = async ({ email, password }, host) => {
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}")
      }`
  const response = await request(host, mutation)
  return {
    authorization: `Bearer ${response.login}`,
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
  Report: createReport,
  Notification: createNotification,
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

export default function Factory(options = {}) {
  let {
    seedServerHost = 'http://127.0.0.1:4001',
    neo4jDriver = getDriver(),
    neodeInstance = neode(),
  } = options

  const graphQLClient = new GraphQLClient(seedServerHost)

  const result = {
    neo4jDriver,
    seedServerHost,
    graphQLClient,
    factories,
    lastResponse: null,
    neodeInstance,
    async authenticateAs({ email, password }) {
      const headers = await authenticatedHeaders({ email, password }, seedServerHost)
      this.lastResponse = headers
      this.graphQLClient = new GraphQLClient(seedServerHost, { headers })
      return this
    },
    async create(node, args = {}) {
      const { factory, mutation, variables } = this.factories[node](args)
      if (factory) {
        this.lastResponse = await factory({ args, neodeInstance })
        return this.lastResponse
      } else {
        this.lastResponse = await this.graphQLClient.request(mutation, variables)
      }
      return this
    },
    async relate(node, relationship, { from, to }) {
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
    async mutate(mutation, variables) {
      this.lastResponse = await this.graphQLClient.request(mutation, variables)
      return this
    },
    async shout(properties) {
      const { id, type } = properties
      const mutation = `
        mutation {
          shout(
            id: "${id}",
            type: ${type}
          )
        }
      `
      this.lastResponse = await this.graphQLClient.request(mutation)
      return this
    },
    async follow(properties) {
      const { id, type } = properties
      const mutation = `
        mutation {
          follow(
            id: "${id}",
            type: ${type}
          )
        }
      `
      this.lastResponse = await this.graphQLClient.request(mutation)
      return this
    },
    async invite({ email }) {
      const mutation = ` mutation($email: String!) { invite( email: $email) } `
      this.lastResponse = await this.graphQLClient.request(mutation, { email })
      return this
    },
    async cleanDatabase() {
      this.lastResponse = await cleanDatabase({ driver: this.neo4jDriver })
      return this
    },
    async emote({ from, to, data }) {
      const mutation = `
        mutation {
          AddPostEmotions(
            from: { id: "${from}" },
            to: { id: "${to}" },
            data: { emotion: ${data} }
          ) {
            from { id }
            to { id }
            emotion
          }
        }
      `
      this.lastResponse = await this.graphQLClient.request(mutation)
      return this
    },
  }
  result.authenticateAs.bind(result)
  result.create.bind(result)
  result.relate.bind(result)
  result.mutate.bind(result)
  result.shout.bind(result)
  result.follow.bind(result)
  result.invite.bind(result)
  result.cleanDatabase.bind(result)
  return result
}
