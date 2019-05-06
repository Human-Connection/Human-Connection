export default {
  Mutation: {
    reward: async (_object, params, context, _resolveInfo) => {
      const { fromBadgeId, toUserId } = params
      const session = context.driver.session()

      let transactionRes = await session.run(
        `MATCH (badge:Badge {id: $badgeId}), (rewardedUser:User {id: $rewardedUserId})
          MERGE (badge)-[:REWARDED]->(rewardedUser)
          RETURN rewardedUser {.id}`,
        {
          badgeId: fromBadgeId,
          rewardedUserId: toUserId
        }
      )

      const [rewardedUser] = transactionRes.records.map(record => {
        return record.get('rewardedUser')
      })

      session.close()

      return rewardedUser.id
    },

    unreward: async (_object, params, context, _resolveInfo) => {
      const { fromBadgeId, toUserId } = params
      const session = context.driver.session()

      let transactionRes = await session.run(
        `MATCH (badge:Badge {id: $badgeId})-[reward:REWARDED]->(rewardedUser:User {id: $rewardedUserId})
        DELETE reward
        RETURN rewardedUser {.id}`,
        {
          badgeId: fromBadgeId,
          rewardedUserId: toUserId
        }
      )
      const [rewardedUser] = transactionRes.records.map(record => {
        return record.get('rewardedUser')
      })
      session.close()

      return rewardedUser.id
    }
  }
}
