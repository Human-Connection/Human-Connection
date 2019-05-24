import fs from 'fs'
import path from 'path'

import userManagement from './resolvers/user_management.js'
import statistics from './resolvers/statistics.js'
import reports from './resolvers/reports.js'
import posts from './resolvers/posts.js'
import moderation from './resolvers/moderation.js'
import follow from './resolvers/follow.js'
import shout from './resolvers/shout.js'
import rewards from './resolvers/rewards.js'
import socialMedia from './resolvers/socialMedia.js'
import notifications from './resolvers/notifications'
import comments from './resolvers/comments'
import users from './resolvers/users'

export const typeDefs = fs
  .readFileSync(process.env.GRAPHQL_SCHEMA || path.join(__dirname, 'schema.graphql'))
  .toString('utf-8')

export const resolvers = {
  Query: {
    ...statistics.Query,
    ...userManagement.Query,
    ...notifications.Query,
    ...comments.Query,
  },
  Mutation: {
    ...userManagement.Mutation,
    ...reports.Mutation,
    ...posts.Mutation,
    ...moderation.Mutation,
    ...follow.Mutation,
    ...shout.Mutation,
    ...rewards.Mutation,
    ...socialMedia.Mutation,
    ...notifications.Mutation,
    ...comments.Mutation,
    ...users.Mutation
  }
}
