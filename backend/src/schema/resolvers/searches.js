const transformReturnType = record => {
  return {
    __typename: record.get('type'),
    ...record.get('resource').properties,
  }
}
export default {
  Query: {
    findResources: async (_parent, args, context, _resolveInfo) => {
      const { query, limit } = args
      const filter = {}
      const { id: thisUserId } = context.user
      // const postQuery = query.replace(/\s/g, '~ ') + '~'
      // const userQuery = query.replace(/\s/g, '~ ') + '~'
      const postCypher = `
      CALL db.index.fulltext.queryNodes('post_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)<-[:WROTE]-(user:User)
      WHERE score >= 0.5
      AND NOT user.deleted = true AND NOT user.disabled = true
      AND NOT resource.deleted = true AND NOT resource.disabled = true
      AND NOT user.id in COALESCE($filter.author_not.id_in, [])
      AND NOT (:User { id: $thisUserId })-[:BLOCKED]-(user)
      RETURN resource, labels(resource)[0] AS type
      LIMIT $limit
      `
      const session = context.driver.session()
      const postResults = await session.run(postCypher, {
        query,
        filter,
        limit,
        thisUserId,
      })
      session.close()
      const userCypher = `
      CALL db.index.fulltext.queryNodes('user_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)
      WHERE score >= 0.5
      AND NOT resource.deleted = true AND NOT resource.disabled = true
      AND NOT (:User { id: $thisUserId })-[:BLOCKED]-(resource)
      RETURN resource, labels(resource)[0] AS type
      LIMIT $limit
      `
      const userResults = await session.run(userCypher, {
        query,
        filter,
        limit,
        thisUserId,
      })
      session.close()
      let result = [...postResults.records, ...userResults.records]
      result = result.map(transformReturnType)
      return result
    },
  },
}
