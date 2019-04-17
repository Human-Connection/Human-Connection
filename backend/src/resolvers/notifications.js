import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Query: {
    Notification: (object, params, context, resolveInfo) => {
      return neo4jgraphql(object, params, context, resolveInfo, false)
    }
  },
  Mutation: {
    UpdateNotification: (object, params, context, resolveInfo) => {
      return neo4jgraphql(object, params, context, resolveInfo, false)
    }
  }
}
