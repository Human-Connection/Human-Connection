import log from './helpers/databaseLogger'
import { queryString } from './searches/queryString'

// see http://lucene.apache.org/core/8_3_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description

export default {
  Query: {
    searchPosts: async (_parent, args, context, _resolveInfo) => {
      const { query, postsOffset, firstPosts } = args
      const { id: userId } = context.user

      const postCypher = `
        CALL db.index.fulltext.queryNodes('post_fulltext_search', $query)
        YIELD node as posts, score
        MATCH (posts)<-[:WROTE]-(author:User)
        WHERE score >= 0.0
        AND NOT (
          author.deleted = true OR author.disabled = true
          OR posts.deleted = true OR posts.disabled = true
          OR (:User {id: $userId})-[:MUTED]->(author)
        )
        WITH posts, author,
        [(posts)<-[:COMMENTS]-(comment:Comment) | comment] as comments,
        [(posts)<-[:SHOUTED]-(user:User) | user] as shouter
        RETURN posts {
          .*,
          __typename: labels(posts)[0],
          author: properties(author),
          commentsCount: toString(size(comments)),
          shoutedCount: toString(size(shouter))
        }
        SKIP $postsOffset
        LIMIT $firstPosts
      `

      const myQuery = queryString(query)

      const session = context.driver.session()
      const searchResultPromise = session.readTransaction(async transaction => {
        const postTransactionResponse = await transaction.run(postCypher, {
          query: myQuery,
          postsOffset,
          firstPosts,
          userId,
        })
        return postTransactionResponse
      })
      try {
        const postResults = await searchResultPromise
        log(postResults)
        return postResults.records.map(record => record.get('posts'))
      } finally {
        session.close()
      }
    },
    searchUsers: async (_parent, args, context, _resolveInfo) => {
      const { query, usersOffset, firstUsers } = args
      const { id: userId } = context.user

      const userCypher = `
        CALL db.index.fulltext.queryNodes('user_fulltext_search', $query)
        YIELD node as users, score
        MATCH (users)
        WHERE score >= 0.0
        AND NOT (users.deleted = true OR users.disabled = true)
        RETURN users {.*, __typename: labels(users)[0]}
        SKIP $usersOffset
        LIMIT $firstUsers
      `
      const myQuery = queryString(query)

      const session = context.driver.session()
      const searchResultPromise = session.readTransaction(async transaction => {
        const userTransactionResponse = await transaction.run(userCypher, {
          query: myQuery,
          usersOffset,
          firstUsers,
          userId,
        })
        return userTransactionResponse
      })

      try {
        const userResults = await searchResultPromise
        log(userResults)
        return userResults.records.map(record => record.get('users'))
      } finally {
        session.close()
      }
    },
    searchResults: async (_parent, args, context, _resolveInfo) => {
      const { query, limit } = args
      const { id: thisUserId } = context.user

      const postCypher = `
      CALL db.index.fulltext.queryNodes('post_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)<-[:WROTE]-(author:User)
      WHERE score >= 0.0
      AND NOT (
        author.deleted = true OR author.disabled = true
        OR resource.deleted = true OR resource.disabled = true
        OR (:User {id: $thisUserId})-[:MUTED]->(author)
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
      WHERE score >= 0.0
      AND NOT (resource.deleted = true OR resource.disabled = true)
      RETURN resource {.*, __typename: labels(resource)[0]}
      LIMIT $limit
      `
      const myQuery = queryString(query)

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
