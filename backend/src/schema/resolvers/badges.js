import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Query: {
    Badge: async (object, args, context, resolveInfo) => {
      return neo4jgraphql(object, args, context, resolveInfo, false)
    },
  },
}
