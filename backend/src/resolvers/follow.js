import gql from 'graphql-tag'
import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    follow: async (object, params, context, resolveInfo) => {
      const result = await neo4jgraphql(object, params, context, resolveInfo, true)
      const { followedId, followedType } = params

      const session = context.driver.session()
      await session.run(
        gql`
          MATCH (n {id: $followedId}), (u:User {id: $userId})
          WHERE $type IN labels(n) AND NOT $id = $userId
          MERGE (u)-[r:FOLLOWS]->(n)
          RETURN COUNT(r) > 0`,
        {
          followedId: followedId,
          type: followedType,
          userId: context.user.id
        }
      )
      session.close()

      return result
    }

    // unfollow: async (_object, params, context, _resolveInfo) => {
    //   const { fromBadgeId, toUserId } = params
    //   const session = context.driver.session()

    //   let sessionRes = await session.run(
    //     `MATCH (badge:Badge {id: $badgeId})-[reward:REWARDED]->(rewardedUser:User {id: $rewardedUserId})
    //       DELETE reward
    //       RETURN rewardedUser {.id}`,
    //     {
    //       badgeId: fromBadgeId,
    //       rewardedUserId: toUserId
    //     }
    //   )
    //   const [rewardedUser] = sessionRes.records.map(record => {
    //     return record.get('rewardedUser')
    //   })
    //   session.close()

    //   return rewardedUser.id
    // }
  }
}
