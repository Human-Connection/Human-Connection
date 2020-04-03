import log from './helpers/databaseLogger'
import { withFilter } from 'graphql-subscriptions'
import { pubsub, NOTIFICATION_ADDED } from '../../server'

const cypherReturnNotificationsWithCollectedResourceData = `
  CALL apoc.case(
    [
      labels(resource)[0] = "Post", '
        MATCH (resource)<-[:WROTE]-(author:User)
        RETURN resource {.*, __typename: labels(resource)[0], author: properties(author)} AS finalResource',
      labels(resource)[0] = "Comment", '
        MATCH (author:User)-[:WROTE]->(resource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(postAuthor:User)
        RETURN resource {.*, __typename: labels(resource)[0], author: properties(author), post: apoc.map.merge(properties(post), {__typename: labels(post)[0], author: properties(postAuthor)})} AS finalResource',
      labels(resource)[0] = "Report", '
        MATCH (reportedResource)<-[:BELONGS_TO]-(resource)<-[filed:FILED]-(user)

        WITH user, filed, resource, reportedResource,
        [(reportedResource)<-[:WROTE]-(author:User) | author {.*}] AS authors,
        [(reportedResource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(author:User) | post {.*, author: properties(author)} ] AS posts

        RETURN {__typename: "FiledReport", reportId: resource.id, createdAt: filed.createdAt, reasonCategory: filed.reasonCategory, reasonDescription: filed.reasonDescription, resource: apoc.map.merge(properties(reportedResource), {__typename: labels(reportedResource)[0], author: authors[0], post: posts[0]})} AS finalResource'
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
        // Wolle MATCH (resource)-[notification:NOTIFIED]->(user:User {id:$id})
        // WHERE
        //   ((labels(resource)[0] in ["Post", "Comment"] AND NOT resource.deleted AND NOT resource.disabled)
        //   OR labels(resource)[0] in ["Report"])
        //   $ {whereClause}
        // WITH user, notification, resource,
        // [(resource)<-[:WROTE]-(author:User) | author {.*}] AS authors,
        // [(resource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(author:User) | post {.*, author: properties(author)} ] AS posts,
        // [(reportedResource)<-[:BELONGS_TO]-(resource)<-[file:FILED]-(user) | file {.*, reportedResource: apoc.map.merge(properties(reportedResource), {__typename: labels(reportedResource)[0]})} ] AS files
        // WITH resource, user, notification, authors, posts, files,
        // resource {.*, __typename: labels(resource)[0], author: authors[0], post: posts[0], filed: files, resource: files[0].reportedResource} AS finalResource
        // RETURN notification {.*, from: finalResource, to: properties(user)}
        // $ {orderByClause}
        // $ {offset} $ {limit}

        MATCH (resource)-[notification:NOTIFIED]->(user:User {id:$id})
        WHERE
          ((labels(resource)[0] in ["Post", "Comment"] AND NOT resource.deleted AND NOT resource.disabled)
          OR labels(resource)[0] in ["Report"])
          ${whereClause}
        ${cypherReturnNotificationsWithCollectedResourceData}
        // Wolle WITH resource, notification, user
        // MATCH (author:User)-[:WROTE]->(resource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(postAuthor:User)
        // WITH resource, notification, user, author, post, postAuthor
        // resource {.*, __typename: labels(resource)[0], author: author, post: apoc.map.merge(properties(post), {__typename: labels(post)[0], author: properties(postAuthor)})} AS finalResource',
        // RETURN notification {.*, from: value.finalResource, to: properties(user)}
        ${orderByClause}
        ${offset} ${limit}

        // Wolle
        // the UNION ALL with ORDER BY and SKIP, LIMIT is possible since Neo4j 4.0. See https://neo4j.com/docs/cypher-manual/4.0/clauses/call-subquery/#subquery-post-union
        // refactor the following to the new CALL {} subquery

        // MATCH (author:User)-[:WROTE]->(post:Post)-[notification:NOTIFIED]->(user:User {id: $id})
        // WHERE NOT post.deleted AND NOT post.disabled
        //   $ {whereClause}
        // WITH user, notification, post {.*, __typename: labels(post)[0], author: properties(author)}
        // RETURN notification {.*, from: post, to: properties(user)}

        // UNION ALL
        // MATCH (author:User)-[:WROTE]->(comment:Comment)-[:COMMENTS]->(post:Post)<-[:WROTE]-(postAuthor:User),
        //   (comment)-[notification:NOTIFIED]->(user:User {id: $id})
        // WHERE NOT comment.deleted AND NOT comment.disabled
        //   $ {whereClause}
        // WITH user, notification, comment {.*, __typename: labels(comment)[0], author: properties(author), post: apoc.map.merge(properties(post), {__typename: labels(post)[0], author: properties(postAuthor)})}
        // RETURN notification {.*, from: comment, to: properties(user)}

        // UNION ALL
        // MATCH (reportedResource)<-[:BELONGS_TO]-(report)<-[file:FILED]-(user:User {id:$id}),
        //   (report:Report)-[notification:NOTIFIED]->(user)
        // WHERE (reportedResource:User) OR (reportedResource:Post) OR (reportedResource:Comment)
        //   $ {whereClause}
        // // Wolle - Here the three different case are not distinguished and therefore Post is not added to Comment and the authors are not added etc.
        // WITH
        //   user,
        //   notification,
        //   {
        //     __typename: "FiledReport",
        //     createdAt: file.createdAt,
        //     reasonCategory: file.reasonCategory,
        //     reasonDescription: file.reasonDescription,
        //     reportId: report.id,
        //     resource: apoc.map.merge(properties(reportedResource), {
        //       __typename: labels(reportedResource)[0]
        //     })
        //   } AS filedReport
        // RETURN notification {.*, from: filedReport, to: properties(user)}
        // $ {orderByClause}
        // $ {offset} $ {limit}
      `

      const readTxResultPromise = session.readTransaction(async (transaction) => {
        const notificationsTransactionResponse = await transaction.run(cypher, {
          id: currentUser.id,
        })
        log(notificationsTransactionResponse)
        const notifications = notificationsTransactionResponse.records.map((record) =>
          record.get('notification'),
        )
        // Wolle notifications.forEach((element, index) => {
        //   console.log('notification #', index, ': ', element)
        //   if (element.from.__typename === 'FiledReport') {
        //     if (element.from.resource.__typename === 'Comment') {
        //       console.log('.from.resource.post.author: ', element.from.resource.post.author)
        //       // console.log('.from.post.author: ', element.from.post.author)
        //     }
        //   }
        // })
        // Wolle console.log('notifications: ', notifications)
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
