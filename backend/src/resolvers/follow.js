export default {
    Mutation: {
      follow: async (_object, params, context, _resolveInfo) => {
        const { followedId, followedType } = params
        const session = context.driver.session()
  
        let sessionRes = await session.run(
          `MATCH (n {id: $id}), (u:User {id: $cypherParams.currentUserId})
           WHERE $type IN labels(n) AND NOT $id = $cypherParams.currentUserId
           MERGE (u)-[r:FOLLOWS]->(n)
           RETURN COUNT(r) > 0`,
          {
            badgeId: fromBadgeId,
            rewardedUserId: toUserId
          }
        )
  
        const [rewardedUser] = sessionRes.records.map(record => {
          return record.get('rewardedUser')
        })
  
        session.close()
  
        return rewardedUser.id
      },
  
      unfollow: async (_object, params, context, _resolveInfo) => {
        const { fromBadgeId, toUserId } = params
        const session = context.driver.session()
  
        let sessionRes = await session.run(
          `MATCH (badge:Badge {id: $badgeId})-[reward:REWARDED]->(rewardedUser:User {id: $rewardedUserId})
          DELETE reward
          RETURN rewardedUser {.id}`,
          {
            badgeId: fromBadgeId,
            rewardedUserId: toUserId
          }
        )
        const [rewardedUser] = sessionRes.records.map(record => {
          return record.get('rewardedUser')
        })
        session.close()
  
        return rewardedUser.id
      }
    }
  }
  