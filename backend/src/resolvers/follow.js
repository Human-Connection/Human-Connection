// import gql from 'graphql-tag'
// import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    follow: async (object, params, context, resolveInfo) => {
      // const result = await neo4jgraphql(object, params, context, resolveInfo, true)
      const { id, type } = params

      const session = context.driver.session()
      let sessionRes = await session.run(
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

      const [ isFollowed ] = sessionRes.records.map(record => {
        return record.get('isFollowed')
      })

      session.close()

      return isFollowed
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
