import { filterForBlockedUsers } from './helpers/filterForBlockedUsers'

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
      const { id: thisUserId } = context.user
      // see http://lucene.apache.org/core/8_3_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description
      const myQuery = query.replace(/\s/g, '* ') + '*'
      const postCypher = `
      CALL db.index.fulltext.queryNodes('post_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)<-[:WROTE]-(user:User)
      WHERE score >= 0.5
      AND NOT (user.deleted = true OR user.disabled = true
      OR resource.deleted = true OR resource.disabled = true
      OR (:User { id: $thisUserId })-[:BLOCKED]-(user))
      RETURN resource, labels(resource)[0] AS type
      LIMIT $limit
      `
      const session = context.driver.session()
      let postResults, userResults
      const readPostTxResultPromise = session.readTransaction(async transaction => {
        const postTransactionResponse = transaction.run(postCypher, {
          query: myQuery,
          limit,
          thisUserId,
        })
        return postTransactionResponse
      })
      try {
        postResults = await readPostTxResultPromise
      } finally {
        session.close()
      }

      const userCypher = `
      CALL db.index.fulltext.queryNodes('user_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)
      WHERE score >= 0.5
      AND NOT (resource.deleted = true OR resource.disabled = true
      OR (:User { id: $thisUserId })-[:BLOCKED]-(resource))
      RETURN resource, labels(resource)[0] AS type
      LIMIT $limit
      `
      const readUserTxResultPromise = session.readTransaction(async transaction => {
        const userTransactionResponse = transaction.run(userCypher, {
          query: myQuery,
          limit,
          thisUserId,
        })
        return userTransactionResponse
      })
      try {
        userResults = await readUserTxResultPromise
      } finally {
        session.close()
      }
      let result = [...postResults.records, ...userResults.records]
      result = result.map(transformReturnType)
      return result
    },
  },
}
