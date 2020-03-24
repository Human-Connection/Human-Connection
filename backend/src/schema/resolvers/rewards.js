import { getNeode } from '../../db/neo4j'
import { UserInputError } from 'apollo-server'

const neode = getNeode()

const getUserAndBadge = async ({ badgeKey, userId }) => {
  const user = await neode.first('User', 'id', userId)
  const badge = await neode.first('Badge', 'id', badgeKey)
  if (!user) throw new UserInputError("Couldn't find a user with that id")
  if (!badge) throw new UserInputError("Couldn't find a badge with that id")
  return { user, badge }
}

export default {
  Mutation: {
    reward: async (_object, params, context, _resolveInfo) => {
      const { user, badge } = await getUserAndBadge(params)
      await user.relateTo(badge, 'rewarded')
      return user.toJson()
    },

    unreward: async (_object, params, context, _resolveInfo) => {
      const { badgeKey, userId } = params
      const { user } = await getUserAndBadge(params)
      const session = context.driver.session()
      try {
        await session.writeTransaction((transaction) => {
          return transaction.run(
            `
              MATCH (badge:Badge {id: $badgeKey})-[reward:REWARDED]->(rewardedUser:User {id: $userId})
              DELETE reward
              RETURN rewardedUser
            `,
            {
              badgeKey,
              userId,
            },
          )
        })
      } finally {
        session.close()
      }
      return user.toJson()
    },
  },
}
