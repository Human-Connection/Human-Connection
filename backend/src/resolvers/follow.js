export default {
  Mutation: {
    follow: async (_object, params, context, _resolveInfo) => {
      const { id, type } = params

      const session = context.driver.session()
      let transactionRes = await session.run(
        `MATCH (node {id: $id}), (user:User {id: $userId})
          WHERE $type IN labels(node) AND NOT $id = $userId
          MERGE (user)-[relation:FOLLOWS]->(node)
          RETURN COUNT(relation) > 0 as isFollowed`,
        {
          id,
          type,
          userId: context.user.id
        }
      )

      const [isFollowed] = transactionRes.records.map(record => {
        return record.get('isFollowed')
      })

      session.close()

      return isFollowed
    },

    unfollow: async (_object, params, context, _resolveInfo) => {
      const { id, type } = params
      const session = context.driver.session()

      let transactionRes = await session.run(
        `MATCH (user:User {id: $userId})-[relation:FOLLOWS]->(node {id: $id})
          WHERE $type IN labels(node)
          DELETE relation
          RETURN COUNT(relation) > 0 as isFollowed`,
        {
          id,
          type,
          userId: context.user.id
        }
      )
      const [isFollowed] = transactionRes.records.map(record => {
        return record.get('isFollowed')
      })
      session.close()

      return isFollowed
    }
  }
}
