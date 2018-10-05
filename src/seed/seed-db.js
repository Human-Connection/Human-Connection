import ApolloClient from "apollo-client";
import dotenv from "dotenv";
import gql from 'graphql-tag'
import seedMutations from "./seed-mutations";
import fetch from "node-fetch";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

dotenv.config();

const client = new ApolloClient({
  link: new HttpLink({ uri: process.env.GRAPHQL_URI, fetch }),
  cache: new InMemoryCache()
});

client
  .mutate({
    mutation: gql(seedMutations)
  })
  .then(data => console.log(data))
  .catch(error => console.error(error));
