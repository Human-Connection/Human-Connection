import uuid from 'uuid/v4'

const transformReturnType = record => {
  return {
    id: uuid(),
    searchResults: {
      __typename: record.get('type'),
      ...record.get('resource').properties,
    },
  }
}
export default {
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
      YIELD node as resource, score
      MATCH (resource)<-[:WROTE]-(user:User)
      WHERE score >= 0.2
      AND NOT user.deleted = true AND NOT user.disabled = true
      AND NOT resource.deleted = true AND NOT resource.disabled = true
      AND NOT user.id in COALESCE($filter.author_not.id_in, [])
      AND NOT (:User { id: $thisUserId })-[:BLOCKED]->(user)
      RETURN resource, labels(resource)[0] AS type
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
      YIELD node as resource, score
      MATCH (resource)
      WHERE score >= 0.2
      AND NOT resource.deleted = true AND NOT resource.disabled = true
      AND NOT (:User { id: $thisUserId })-[:BLOCKED]->(resource)
      RETURN resource, labels(resource)[0] AS type
      LIMIT $limit
      `
      const userResults = await session.run(userCypher, {
        query: userQuery,
        filter: filter,
        limit: limit,
        thisUserId: thisUserId,
      })

      session.close()
      const result = postResults.records.concat(userResults.records).map(transformReturnType)

      return result
    },
  },
}
