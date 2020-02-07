import log from './helpers/databaseLogger'

const resourceTypes = ['Post', 'Comment', 'Report']

const transformReturnType = record => {
  return {
    ...record.get('notification').properties,
    from: {
      __typename: record.get('resource').labels.find(l => resourceTypes.includes(l)),
      ...record.get('resource').properties,
    },
    to: {
      ...record.get('user').properties,
    },
  }
}

export default {
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

      const readTxResultPromise = session.readTransaction(async transaction => {
        const notificationsTransactionResponse = await transaction.run(
          ` 
            // Wolle MATCH (resource)-[notification:NOTIFIED]->(user:User {id:$id})
            // WHERE
            //   ((labels(resource)[0] in ["Post", "Comment"] AND NOT resource.deleted AND NOT resource.disabled)
            //   OR labels(resource)[0] in ["Report"])
            //   ${whereClause}
            // WITH user, notification, resource,
            // [(resource)<-[:WROTE]-(author:User) | author {.*}] AS authors,
            // [(resource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(author:User) | post {.*, author: properties(author)} ] AS posts,
            // [(reportedResource)<-[:BELONGS_TO]-(resource)<-[file:FILED]-(user) | file {.*, reportedResource: apoc.map.merge(properties(reportedResource), {__typename: labels(reportedResource)[0]})} ] AS files
            // WITH resource, user, notification, authors, posts, files,
            // resource {.*, __typename: labels(resource)[0], author: authors[0], post: posts[0], filed: files, resource: files[0].reportedResource} AS finalResource
            // RETURN notification {.*, from: finalResource, to: properties(user)}

            MATCH (author:User)-[:WROTE]->(post:Post)-[notification:NOTIFIED]->(user:User {id: $id})
            WHERE NOT post.deleted AND NOT post.disabled
              ${whereClause}
            WITH user, notification, post {.*, __typename: labels(post)[0], author: properties(author)}
            RETURN notification {.*, from: post, to: properties(user)}

            UNION ALL
            MATCH (author:User)-[:WROTE]->(comment:Comment)-[:COMMENTS]->(post:Post)<-[:WROTE]-(postAuthor:User),
              (comment)-[notification:NOTIFIED]->(user:User {id: $id})
            WHERE NOT comment.deleted AND NOT comment.disabled
              ${whereClause}
            WITH user, notification, comment {.*, __typename: labels(comment)[0], author: properties(author), post: apoc.map.merge(properties(post), {__typename: labels(post)[0], author: properties(postAuthor)})}
            RETURN notification {.*, from: comment, to: properties(user)}

            UNION ALL
            MATCH (report:Report)-[notification:NOTIFIED]->(user:User {id:$id}),
              (reportedResource)<-[:BELONGS_TO]-(report)<-[file:FILED]-(user)
            WHERE (reportedResource:User) OR (reportedResource:Post) OR (reportedResource:Comment)
              ${whereClause}
            // Wolle - Here the three different case are not distinguished and therefore Post is not added to Comment and the authors are not added etc.
            WITH user, notification, filedExpose {__typename: "FILEDExpose", reasonCategory: file.reasonCategory, reasonDescription: file.reasonDescription, reportedResource: apoc.map.merge(properties(reportedResource), {__typename: labels(reportedResource)[0]})}
            RETURN notification {.*, from: filedExpose, to: properties(user)}
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
            MATCH (resource {id: $resourceId})-[notification:NOTIFIED {read: FALSE}]->(user:User {id: $id})
            SET notification.read = TRUE
            RETURN resource, notification, user
          `,
          {
            resourceId: args.id,
            id: currentUser.id,
          },
        )
        log(markNotificationAsReadTransactionResponse)
        return markNotificationAsReadTransactionResponse.records.map(transformReturnType)
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
