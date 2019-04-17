import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    CreateComment: (object, params, context, resolveInfo) => {
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
    AddPostComments: (object, params, context, resolveInfo) => {
      return neo4jgraphql(object, params, context, resolveInfo, false)
    }
  }
}
