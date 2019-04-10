import fs from 'fs'
import path from 'path'

import userManagement from './resolvers/user_management.js'
import statistics from './resolvers/statistics.js'
import reports from './resolvers/reports.js'
import posts from './resolvers/posts.js'
import moderation from './resolvers/moderation.js'
import follow from './resolvers/follow.js'
import rewards from './resolvers/rewards.js'
import notifications from './resolvers/notifications'

export const typeDefs = fs
  .readFileSync(
    process.env.GRAPHQL_SCHEMA || path.join(__dirname, 'schema.graphql')
  )
  .toString('utf-8')

export const resolvers = {
  Query: {
    ...statistics.Query,
    ...userManagement.Query,
    ...notifications.Query
  },
  Mutation: {
    ...userManagement.Mutation,
    ...reports.Mutation,
    ...posts.Mutation,
    ...moderation.Mutation,
    ...follow.Mutation,
    ...rewards.Mutation,
    ...notifications.Mutation
  }
}
