import log from './helpers/databaseLogger'
import { withFilter } from 'graphql-subscriptions'
import { pubsub, NOTIFICATION_ADDED } from '../../server'

const cypherReturnNotificationsWithCollectedResourceData = `
  CALL apoc.case(
    [
      labels(resource)[0] = "Post", '
        MATCH (resource)<-[:WROTE]-(author:User)
        RETURN resource {.*, __typename: labels(resource)[0], author: properties(author)} AS finalResource
      ',
      labels(resource)[0] = "Comment", '
        MATCH (author:User)-[:WROTE]->(resource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(postAuthor:User)
        RETURN resource {
          .*, __typename: labels(resource)[0], author: properties(author), post: apoc.map.merge(properties(post), {
            __typename: labels(post)[0],
            author: properties(postAuthor)
          })
        } AS finalResource
      ',
      labels(resource)[0] = "Report", '
        MATCH (reportedResource)<-[:BELONGS_TO]-(resource)<-[filed:FILED]-(user)

        WITH user, filed, resource, reportedResource,
          [(reportedResource)<-[:WROTE]-(author:User) | author {.*}] AS authors,
          [(reportedResource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(author:User) | post {.*, author: properties(author)} ] AS posts

        RETURN {
          __typename: "FiledReport",
          reportId: resource.id,
          createdAt: filed.createdAt,
          reasonCategory: filed.reasonCategory,
          reasonDescription: filed.reasonDescription,
          resource: apoc.map.merge(properties(reportedResource), {
            __typename: labels(reportedResource)[0],
            author: authors[0],
            post: posts[0]
          })
        } AS finalResource
      '
    ],
    '',
    {
      resource: resource,
      user: user
    }) YIELD value
    RETURN notification {.*, from: value.finalResource, to: properties(user)}
`

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
          whereClause = 'AND notification.read = TRUE'
          break
        case false:
          whereClause = 'AND notification.read = FALSE'
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

      const cypher = `
        MATCH (resource)-[notification:NOTIFIED]->(user:User {id:$id})
        WHERE
          ((labels(resource)[0] in ["Post", "Comment"] AND NOT resource.deleted AND NOT resource.disabled)
          OR labels(resource)[0] in ["Report"])
          ${whereClause}
        ${cypherReturnNotificationsWithCollectedResourceData}
        ${orderByClause}
        ${offset} ${limit}
      `

      const readTxResultPromise = session.readTransaction(async (transaction) => {
        const notificationsTransactionResponse = await transaction.run(cypher, {
          id: currentUser.id,
        })
        log(notificationsTransactionResponse)
        const notifications = notificationsTransactionResponse.records.map((record) =>
          record.get('notification'),
        )
        return notifications
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
    markAsRead: async (_parent, args, context, _resolveInfo) => {
      const { user: currentUser } = context
      const session = context.driver.session()
      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const markNotificationAsReadTransactionResponse = await transaction.run(
          ` 
            MATCH (resource {id: $resourceId})-[notification:NOTIFIED {read: FALSE}]->(user:User {id: $id})
            SET notification.read = TRUE
            WITH resource, notification, user
            ${cypherReturnNotificationsWithCollectedResourceData}
          `,
          {
            resourceId: args.id,
            id: currentUser.id,
          },
        )
        log(markNotificationAsReadTransactionResponse)
        return markNotificationAsReadTransactionResponse.records.map((record) =>
          record.get('notification'),
        )
      })
      try {
        const [notification] = await writeTxResultPromise
        return notification
      } finally {
        session.close()
      }
    },
  },
  NOTIFIED: {
    id: async (parent) => {
      // serialize an ID to help the client update the cache
      return `${parent.reason}/${parent.from.id || parent.from.reportId}/${parent.to.id}`
    },
  },
}
