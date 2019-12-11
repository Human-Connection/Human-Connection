export default {
  SearchResult: {
    __resolveType(obj, context, info) {
      if (obj.encryptedPassword) {
        return 'User'
      }
      if (obj.content) {
        return 'Post'
      }
      return null
    },
  },
  Query: {
    findResources: async (_parent, args, context, _resolveInfo) => {
      const query = args.query
      const filter = {}
      const limit = args.limit
      const { user } = context
      const thisUserId = user.id
      const postQuery = query.replace(/\s/g, '~ ') + '~'
      const userQuery = query.replace(/\s/g, '~ ') + '~'
      const postCypher = `
      CALL db.index.fulltext.queryNodes('post_fulltext_search', $query)
      YIELD node as post, score
      MATCH (post)<-[:WROTE]-(user:User)
      WHERE score >= 0.2
      AND NOT user.deleted = true AND NOT user.disabled = true
      AND NOT post.deleted = true AND NOT post.disabled = true
      AND NOT user.id in COALESCE($filter.author_not.id_in, [])
      AND NOT (:User { id: $thisUserId })-[:BLOCKED]->(user)
      RETURN post
      LIMIT $limit
      `
      const session = context.driver.session()
      const postResults = await session.run(postCypher, {
        query: postQuery,
        filter: filter,
        limit: limit,
        thisUserId: thisUserId,
      })
      session.close()
      const userCypher = `
      CALL db.index.fulltext.queryNodes('user_fulltext_search', $query)
      YIELD node as user, score
      MATCH (user)
      WHERE score >= 0.2
      AND NOT user.deleted = true AND NOT user.disabled = true
      AND NOT (:User { id: $thisUserId })-[:BLOCKED]->(user)
      RETURN user
      LIMIT $limit
      `
      const userResults = await session.run(userCypher, {
        query: userQuery,
        filter: filter,
        limit: limit,
        thisUserId: thisUserId,
      })

      session.close()
      const result = []
      postResults.records
        .concat(userResults.records)
        .forEach(record => result.push(record._fields[0].properties))
      return result
    },
  },
}
