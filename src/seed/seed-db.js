import ApolloClient from 'apollo-client'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import Seed from './data/index'

dotenv.config()

if (process.env.NODE_ENV === 'production') {
  throw new Error('YOU CAN`T SEED IN PRODUCTION MODE')
}

const client = new ApolloClient({
  link: new HttpLink({ uri: process.env.GRAPHQL_URI, fetch }),
  cache: new InMemoryCache()
})

Seed(client)
