import { neo4jgraphql } from 'neo4j-graphql-js'
import uuid from 'uuid/v4'

export default {
  Mutation: {
    CreateInvitationCode: async (parent, args, context, resolveInfo) => {
      const code = uuid().substring(0, 6)
      args = { ...args, code }
      return neo4jgraphql(parent, args, context, resolveInfo, false)
    },
  },
}
