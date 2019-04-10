export default {
  Mutation: {
    shout: async (_object, params, context, _resolveInfo) => {
      const { id, type } = params

      const session = context.driver.session()
      let sessionRes = await session.run(
        `MATCH (node {id: $id})<-[:WROTE]-(userWritten:User), (user:User {id: $userId})
          WHERE $type IN labels(node) AND NOT userWritten.id = $userId
          MERGE (user)-[relation:SHOUTED]->(node)
          RETURN COUNT(relation) > 0 as isShouted`,
        {
          id,
          type,
          userId: context.user.id
        }
      )

      const [isShouted] = sessionRes.records.map(record => {
        return record.get('isShouted')
      })

      session.close()

      return isShouted
    },

    unshout: async (_object, params, context, _resolveInfo) => {
      const { id, type } = params
      const session = context.driver.session()

      let sessionRes = await session.run(
        `MATCH (user:User {id: $userId})-[relation:SHOUTED]->(node {id: $id})
          WHERE $type IN labels(node)
          DELETE relation
          RETURN COUNT(relation) > 0 as isShouted`,
        {
          id,
          type,
          userId: context.user.id
        }
      )
      const [isShouted] = sessionRes.records.map(record => {
        return record.get('isShouted')
      })
      session.close()

      return isShouted
    }
  }
}
