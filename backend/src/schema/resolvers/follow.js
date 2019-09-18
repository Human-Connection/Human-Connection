import { neode as getNeode } from '../../bootstrap/neo4j'

const neode = getNeode()

export default {
  Mutation: {
    follow: async (_object, params, context, _resolveInfo) => {
      const { id: followedId, type } = params
      const { user: currentUser } = context

      if (type === 'User' && currentUser.id === followedId) {
        return null
      }

      const [user, followedNode] = await Promise.all([
        neode.find('User', currentUser.id),
        neode.find(type, followedId),
      ])
      await user.relateTo(followedNode, 'following')
      return followedNode.toJson()
    },

    unfollow: async (_object, params, context, _resolveInfo) => {
      const { id: followedId, type } = params
      const { user: currentUser } = context

      /*
       * Note: Neode doesn't provide an easy method for retrieving or removing relationships.
       * It's suggested to use query builder feature (https://github.com/adam-cowley/neode/issues/67)
       * However, pure cypher query looks cleaner IMO
       */
      await neode.cypher(
        `MATCH (user:User {id: $currentUser.id})-[relation:FOLLOWS]->(node {id: $followedId})
          WHERE $type IN labels(node)
          DELETE relation
          RETURN COUNT(relation) > 0 as isFollowed`,
        { followedId, type, currentUser },
      )

      const followedNode = await neode.find(type, followedId)
      return followedNode.toJson()
    },
  },
}
