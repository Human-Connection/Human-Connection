import log from './helpers/databaseLogger'

export default {
  Query: {
    findResources: async (_parent, args, context, _resolveInfo) => {
      const { query, limit } = args
      const { id: thisUserId } = context.user
      // see http://lucene.apache.org/core/8_3_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description
      const myQuery = query
        .replace(/\s+/g, ' ')
        .replace(/[[@#:*~\\$|^\]?/"'(){}+?!,.-]/g, '')
        .split(' ')
        .map(s => (s.toLowerCase().match(/^(not|and|or)$/) ? '"' + s + '"' : s + '*'))
        .join(' ')
      // console.log(myQuery)
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

/* order users by closest geolocation could look like this

MATCH (u1:User { id: $thisUserId })-[:IS_IN]->(l1:Location)
MATCH (u2:User)-[:IS_IN]->(l2:Location)
WHERE NOT(u2.id = $thisUserId)
AND NOT (u2.deleted = true OR u2.disabled = true
OR (u1)-[:BLOCKED]-(u2))
WITH point({longitude: l1.lng, latitude: l1.lat}) AS P1,
point({longitude: l2.lng, latitude: l2.lat}) AS P2,
u2 AS otherUsers
WITH distance(P1, P2) AS Distance,
otherUsers AS users
ORDER BY Distance
RETURN users

*/

/* This query is to test if the calculation of distances works.
See:
https://github.com/Human-Connection/Human-Connection/issues/2587

MATCH (u1:User { name: 'Huey' })-[:IS_IN]->(l1:Location)
MATCH (u2:User)-[:IS_IN]->(l2:Location)
WHERE NOT(u2.name = 'Huey')
WITH point({longitude: l1.lng, latitude: l1.lat}) AS P1,
point({longitude: l2.lng, latitude: l2.lat}) AS P2,
l1.name AS Location1, l2.name AS Location2
WITH distance(P1, P2) AS Distance,
Location1 AS Location1, Location2 AS Location2
ORDER BY Distance
RETURN Location1, Location2, Distance
*/
