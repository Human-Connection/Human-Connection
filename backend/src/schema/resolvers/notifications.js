const resourceTypes = ['Post', 'Comment']

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
    notifications: async (parent, args, context, resolveInfo) => {
      const { user: currentUser } = context
      const session = context.driver.session()
      let notifications
      let whereClause
      let orderByClause
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
        case 'createdAt_asc':
          orderByClause = 'ORDER BY notification.createdAt ASC'
          break
        case 'createdAt_desc':
          orderByClause = 'ORDER BY notification.createdAt DESC'
          break
        default:
          orderByClause = ''
      }

      try {
        const cypher = `
        MATCH (resource {deleted: false, disabled: false})-[notification:NOTIFIED]->(user:User {id:$id})
        ${whereClause}
        RETURN resource, notification, user
        ${orderByClause}
        `
        const result = await session.run(cypher, { id: currentUser.id })
        notifications = await result.records.map(transformReturnType)
      } finally {
        session.close()
      }
      return notifications
    },
  },
  Mutation: {
    markAsRead: async (parent, args, context, resolveInfo) => {
      const { user: currentUser } = context
      const session = context.driver.session()
      let notification
      try {
        const cypher = `
        MATCH (resource {id: $resourceId})-[notification:NOTIFIED {read: FALSE}]->(user:User {id:$id})
        SET notification.read = TRUE
        RETURN resource, notification, user
        `
        const result = await session.run(cypher, { resourceId: args.id, id: currentUser.id })
        const notifications = await result.records.map(transformReturnType)
        notification = notifications[0]
      } finally {
        session.close()
      }
      return notification
    },
  },
}
