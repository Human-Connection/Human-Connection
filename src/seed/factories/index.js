import { GraphQLClient } from 'graphql-request'
import ApolloClient from 'apollo-client'
import dotenv from 'dotenv'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import neo4j from '../../bootstrap/neo4j'
import fetch from 'node-fetch'

export const seedServerHost = 'http://127.0.0.1:4001'

dotenv.config()

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: seedServerHost, fetch }),
  cache: new InMemoryCache()
})

const driver = neo4j().getDriver()

const builders = {
  'badge': require('./badges.js').default,
  'user': require('./users.js').default,
  'post': require('./posts.js').default,
  'category': require('./categories.js').default,
  'tag': require('./tags.js').default
}

const relationBuilders = {
  'user': require('./users.js').relate
}

const buildMutation = (model, parameters) => {
  return builders[model](parameters)
}

const buildRelationMutation = (model, type, parameters) => {
  return relationBuilders[model](type, parameters)
}

const create = (model, parameters, options) => {
  const graphQLClient = new GraphQLClient(seedServerHost, options)
  const mutation = buildMutation(model, parameters)
  return graphQLClient.request(mutation)
}

const relate = (model, type, parameters, options) => {
  const graphQLClient = new GraphQLClient(seedServerHost, options)
  const mutation = buildRelationMutation(model, type, parameters)
  return graphQLClient.request(mutation)
}

const cleanDatabase = async () => {
  const session = driver.session()
  const cypher = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r'
  try {
    return await session.run(cypher)
  } catch (error) {
    console.log(error)
  } finally {
    session.close()
  }
}

export {
  driver,
  apolloClient,
  buildMutation,
  buildRelationMutation,
  create,
  relate,
  cleanDatabase
}
