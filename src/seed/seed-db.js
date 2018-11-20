import ApolloClient from "apollo-client";
import dotenv from "dotenv";
import gql from 'graphql-tag'
import fetch from "node-fetch";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import Seed from './data/index'

dotenv.config();

const client = new ApolloClient({
  link: new HttpLink({ uri: process.env.GRAPHQL_URI, fetch }),
  cache: new InMemoryCache()
});

Seed(client)

/* client
  .mutate({
    mutation: gql(seedMutations)
  })
  .then(data => console.log(data))
  .catch(error => console.error(error)); **/
