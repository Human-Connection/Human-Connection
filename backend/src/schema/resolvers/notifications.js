import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Query: {
    notifications: async (parent, params, context, resolveInfo) => {
      const { user, driver } = context
      let session
      let notifications
      try {
        session = context.driver.session()
        const cypher = `
        MATCH (resource)-[notification:NOTIFIED]->(user:User {id:$id})
        RETURN resource, notification, user
        `
        const result = await session.run(cypher, { id: user.id })
        const resourceTypes = ['Post', 'Comment']
        notifications = await result.records.map(record => {
          return {
            ...record.get('notification').properties,
            from: {
              __typename: record.get('resource').labels.find(l => resourceTypes.includes(l)),
              ...record.get('resource').properties
            },
            to: {
              __typename: 'User',
              ...record.get('user').properties,
            }
          }
        })
      } finally {
        session.close()
      }
      return notifications
    },
    Notification: (object, params, context, resolveInfo) => {
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
  },
  Mutation: {
    UpdateNotification: (object, params, context, resolveInfo) => {
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
  },
}
