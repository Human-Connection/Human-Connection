import { neo4jgraphql } from 'neo4j-graphql-js'


export default {
  Query: {
    Organization: async (object, params, context, resolveInfo) => {
      return neo4jgraphql(object, params, context, resolveInfo)
    },
  },
  Mutation: {
    CreateOrganization: async (object, params, context, resolveInfo) => {
    },
  },
}
