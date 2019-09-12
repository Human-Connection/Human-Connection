const resourceTypes = ['Post', 'Comment']

const transformReturnType = record => {
  return {
    ...record.get('notification'),
    from: {
      __typename: record.get('labels(resource)').find(l => resourceTypes.includes(l)),
      ...record.get('resource'),
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
        case 'created_at_asc':
          orderByClause = 'ORDER BY notification.created_at ASC'
          break
        case 'created_at_desc':
          orderByClause = 'ORDER BY notification.created_at DESC'
          break
        default:
          orderByClause = ''
      }

      try {
        const cypher = `
        MATCH (resource {deleted: false, disabled: false})-[notification:NOTIFIED]->(user:User {id:$id})
        ${whereClause}
        RETURN resource {.id, .content, created_at: { formatted: toString(notification.created_at) }} as resource, notification {.read, .reason, created_at: { formatted: toString(notification.created_at) }} as notification, user, labels(resource)
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
        RETURN resource {.id, .content, created_at: { formatted: toString(notification.created_at) }} as resource, notification {.read, .reason, created_at: { formatted: toString(notification.created_at) }} as notification, user, labels(resource)
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
