export default {
  SearchResult: {
    __resolveType(obj, context, info) {
      console.log('----', obj.keys)
      if (obj.keys.includes('user')) {
        return info.schema.getType('User')
      }

      if (obj.keys.includes('post')) {
        return info.schema.getType('Post')
      }
      return null
    },
  },
  Query: {
    findAnything: async (_parent, args, context, _resolveInfo) => {
      const query = args.query
      const filter = {}
      const limit = args.limit
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
      RETURN post
      LIMIT $limit
      `
      const session = context.driver.session()
      const postResults = await session.run(postCypher, {
        query: postQuery,
        filter: filter,
        limit: limit,
      })
      session.close()
      const userCypher = `
      CALL db.index.fulltext.queryNodes('user_fulltext_search', $query)
      YIELD node as post, score
      MATCH (user)
      WHERE score >= 0.2
      AND NOT user.deleted = true AND NOT user.disabled = true
      RETURN user
      LIMIT $limit
      `
      const userResults = await session.run(userCypher, {
        query: userQuery,
        filter: filter,
        limit: limit,
      })

      session.close()
      console.log(postResults.records.concat(userResults.records))
      return postResults.records.concat(userResults.records)
    },
  },
}
