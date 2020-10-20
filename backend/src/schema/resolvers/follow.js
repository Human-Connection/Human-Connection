import { getNeode } from '../../db/neo4j'

const neode = getNeode()

export default {
  Mutation: {
    followUser: async (_object, params, context, _resolveInfo) => {
      const { id: followedUserId } = params
      const { user: currentUser } = context

      if (currentUser.id === followedUserId) {
        return null
      }

      const [user, followedUser] = await Promise.all([
        neode.find('User', currentUser.id),
        neode.find('User', followedUserId),
      ])
      await user.relateTo(followedUser, 'following')
      return followedUser.toJson()
    },

    followOrg: async (_object, params, context, _resolveInfo) => {
      const { id: followedOrgId } = params
      const { user: currentUser } = context

      const [user, followedOrg] = await Promise.all([
        neode.find('User', currentUser.id),
        neode.find('Organization', followedOrgId),
      ])
      await user.relateTo(followedOrg, 'orgFollowing')
      return followedOrg.toJson()
    },

    showInterest: async (_object, params, context, _resolveInfo) => {
      const { id: interestedServiceId } = params
      const { user: currentUser } = context

      const [user, interestedSer] = await Promise.all([
        neode.find('User', currentUser.id),
        neode.find('Service', interestedServiceId),
      ])
      await user.relateTo(interestedSer, 'serviceInterested')
      return interestedSer.toJson()
    },

    unfollowUser: async (_object, params, context, _resolveInfo) => {
      const { id: followedUserId } = params
      const { user: currentUser } = context

      /*
       * Note: Neode doesn't provide an easy method for retrieving or removing relationships.
       * It's suggested to use query builder feature (https://github.com/adam-cowley/neode/issues/67)
       * However, pure cypher query looks cleaner IMO
       */
      await neode.cypher(
        `MATCH (user:User {id: $currentUser.id})-[relation:FOLLOWS]->(followedUser:User {id: $followedUserId})
          DELETE relation
          RETURN COUNT(relation) > 0 as isFollowed`,
        { followedUserId, currentUser },
      )

      const followedUser = await neode.find('User', followedUserId)
      return followedUser.toJson()
    },
  },
}
