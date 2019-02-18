import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import dotenv from 'dotenv'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import neo4j from '../../bootstrap/neo4j'
import fetch from 'node-fetch'

dotenv.config()

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4001', fetch }),
  cache: new InMemoryCache()
})

const driver = neo4j().getDriver()

const builders = {
  'user': require('./users.js').default
}

const buildMutation = (model, parameters) => {
  return builders[model](parameters)
}

const create = (model, parameters) => {
  return apolloClient.mutate({ mutation: gql(buildMutation(model, parameters)) })
}

const cleanDatabase = async () => {
  const session = driver.session()
  const cypher = 'MATCH (n) DETACH DELETE n'
  try {
    const result = await session.run(cypher)
    session.close()
    return result
  } catch (error) {
    console.log(error)
  }
}

export {
  driver,
  apolloClient,
  create,
  buildMutation,
  cleanDatabase
}
