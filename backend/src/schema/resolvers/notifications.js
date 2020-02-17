import log from './helpers/databaseLogger'
import { withFilter } from 'graphql-subscriptions'
import { pubsub, NOTIFICATION_ADDED } from '../../server'

export default {
  Subscription: {
    notificationAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NOTIFICATION_ADDED),
        (payload, variables) => {
          return payload.notificationAdded.to.id === variables.userId
        },
      ),
    },
  },
  Query: {
    notifications: async (_parent, args, context, _resolveInfo) => {
      const { user: currentUser } = context
      const session = context.driver.session()
      let whereClause, orderByClause

      switch (args.read) {
        case true:
          whereClause = 'WHERE notification.read = TRUE'
          break
        case false:
          whereClause = 'WHERE notification.read = FALSE'
          break
        default:
          whereClause = ''
      }
      switch (args.orderBy) {
        case 'updatedAt_asc':
          orderByClause = 'ORDER BY notification.updatedAt ASC'
          break
        case 'updatedAt_desc':
          orderByClause = 'ORDER BY notification.updatedAt DESC'
          break
        default:
          orderByClause = ''
      }
      const offset = args.offset && typeof args.offset === 'number' ? `SKIP ${args.offset}` : ''
      const limit = args.first && typeof args.first === 'number' ? `LIMIT ${args.first}` : ''

      const readTxResultPromise = session.readTransaction(async transaction => {
        const notificationsTransactionResponse = await transaction.run(
          ` 
          MATCH (resource {deleted: false, disabled: false})-[notification:NOTIFIED]->(user:User {id:$id})
          ${whereClause}
          WITH user, notification, resource,
          [(resource)<-[:WROTE]-(author:User) | author {.*}] AS authors,
          [(resource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(author:User) | post{.*, author: properties(author)} ] AS posts
          WITH resource, user, notification, authors, posts,
          resource {.*, __typename: labels(resource)[0], author: authors[0], post: posts[0]} AS finalResource
          RETURN notification {.*, from: finalResource, to: properties(user)}
          ${orderByClause}
          ${offset} ${limit}
          `,
          { id: currentUser.id },
        )
        log(notificationsTransactionResponse)
        return notificationsTransactionResponse.records.map(record => record.get('notification'))
      })
      try {
        const notifications = await readTxResultPromise
        return notifications
      } finally {
        session.close()
      }
    },
  },
  Mutation: {
    markAsRead: async (parent, args, context, resolveInfo) => {
      const { user: currentUser } = context
      const session = context.driver.session()
      const writeTxResultPromise = session.writeTransaction(async transaction => {
        const markNotificationAsReadTransactionResponse = await transaction.run(
          ` 
            MATCH (resource {id: $resourceId})-[notification:NOTIFIED {read: FALSE}]->(user:User {id:$id})
            SET notification.read = TRUE
            WITH user, notification, resource,
            [(resource)<-[:WROTE]-(author:User) | author {.*}] AS authors,
            [(resource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(author:User) | post{.*, author: properties(author)} ] AS posts
            WITH resource, user, notification, authors, posts,
            resource {.*, __typename: labels(resource)[0], author: authors[0], post: posts[0]} AS finalResource
            RETURN notification {.*, from: finalResource, to: properties(user)}
          `,
          { resourceId: args.id, id: currentUser.id },
        )
        log(markNotificationAsReadTransactionResponse)
        return markNotificationAsReadTransactionResponse.records.map(record =>
          record.get('notification'),
        )
      })
      try {
        const [notifications] = await writeTxResultPromise
        return notifications
      } finally {
        session.close()
      }
    },
  },
  NOTIFIED: {
    id: async parent => {
      // serialize an ID to help the client update the cache
      return `${parent.reason}/${parent.from.id}/${parent.to.id}`
    },
  },
}
