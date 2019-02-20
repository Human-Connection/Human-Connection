import { GraphQLClient } from 'graphql-request'
import { getDriver } from '../../bootstrap/neo4j'

export const seedServerHost = 'http://127.0.0.1:4001'

const factories = {
  'badge':        require('./badges.js').default,
  'user':         require('./users.js').default,
  'organization': require('./organizations.js').default,
  'post':         require('./posts.js').default,
  'comment':      require('./comments.js').default,
  'category':     require('./categories.js').default,
  'tag':          require('./tags.js').default,
  'report':       require('./reports.js').default
}

const relationFactories = {
  'user':         require('./users.js').relate,
  'organization': require('./organizations.js').relate,
  'post':         require('./posts.js').relate,
  'comment':      require('./comments.js').relate
}

const create = (model, parameters, options) => {
  const graphQLClient = new GraphQLClient(seedServerHost, options)
  const mutation = factories[model](parameters)
  return graphQLClient.request(mutation)
}

const relate = (model, type, parameters, options) => {
  const graphQLClient = new GraphQLClient(seedServerHost, options)
  const mutation = relationFactories[model](type, parameters)
  return graphQLClient.request(mutation)
}

const cleanDatabase = async (options = {}) => {
  const {
    driver = getDriver()
  } = options
  const session = driver.session()
  const cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r'
  try {
    return await session.run(cypher)
  } catch (error) {
    throw(error)
  } finally {
    session.close()
  }
}

export {
  create,
  relate,
  cleanDatabase
}
