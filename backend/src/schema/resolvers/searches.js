import log from './helpers/databaseLogger'

export default {
  Query: {
    findResources: async (_parent, args, context, _resolveInfo) => {
      const { query, limit } = args
      const { id: thisUserId } = context.user
      // see http://lucene.apache.org/core/8_3_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description
      const myQuery = query
        .replace(/\s+/g, ' ')
        .replace(/[[@#:*~\\$|^\]?/"'(){}+?!,.-;]/g, '')
        .split(' ')
        .map(s => (s.toLowerCase().match(/^(not|and|or)$/) ? '"' + s + '"' : s + '*'))
        .join(' ')
      const postCypher = `
      CALL db.index.fulltext.queryNodes('post_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)<-[:WROTE]-(author:User)
      WHERE score >= 0.5
      AND NOT (
        author.deleted = true OR author.disabled = true
        OR resource.deleted = true OR resource.disabled = true
        OR (:User { id: $thisUserId })-[:BLOCKED]-(author)
      )
      WITH resource, author,
      [(resource)<-[:COMMENTS]-(comment:Comment) | comment] as comments,
      [(resource)<-[:SHOUTED]-(user:User) | user] as shouter
      RETURN resource {
        .*,
        __typename: labels(resource)[0],
        author: properties(author),
        commentsCount: toString(size(comments)),
        shoutedCount: toString(size(shouter))
      }
      LIMIT $limit
      `

      const userCypher = `
      CALL db.index.fulltext.queryNodes('user_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)
      WHERE score >= 0.5
      AND NOT (resource.deleted = true OR resource.disabled = true
      OR (:User { id: $thisUserId })-[:BLOCKED]-(resource))
      RETURN resource {.*, __typename: labels(resource)[0]}
      LIMIT $limit
      `

      const session = context.driver.session()
      const searchResultPromise = session.readTransaction(async transaction => {
        const postTransactionResponse = transaction.run(postCypher, {
          query: myQuery,
          limit,
          thisUserId,
        })
        const userTransactionResponse = transaction.run(userCypher, {
          query: myQuery,
          limit,
          thisUserId,
        })
        return Promise.all([postTransactionResponse, userTransactionResponse])
      })

      try {
        const [postResults, userResults] = await searchResultPromise
        log(postResults)
        log(userResults)
        return [...postResults.records, ...userResults.records].map(r => r.get('resource'))
      } finally {
        session.close()
      }
    },
  },
}
