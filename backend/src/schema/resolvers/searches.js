import log from './helpers/databaseLogger'
import { queryString } from './searches/queryString'

// see http://lucene.apache.org/core/8_3_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description

const createCypher = (setup) => `
  CALL db.index.fulltext.queryNodes('${setup.fulltextIndex}', $query)
  YIELD node as resource, score
  ${setup.match}
  WHERE score >= 0.0
  ${setup.notClause}
  ${setup.withClause}
  RETURN 
  {
    ${setup.countKeyName}: toString(size(collect(resource))),
    ${setup.resultKeyName}: collect(resource { .*, __typename: labels(resource)[0]${setup.additionalMapping} })
  }
  AS ${setup.resultName}
  SKIP $skip
  LIMIT $limit
`

const simpleNotClause = 'AND NOT (resource.deleted = true OR resource.disabled = true)'

const postNotClause = `AND NOT (
    author.deleted = true OR author.disabled = true
    OR resource.deleted = true OR resource.disabled = true
    OR (:User {id: $userId})-[:MUTED]->(author)
  )`

const searchPostsSetup = {
  fulltextIndex: 'post_fulltext_search',
  match: 'MATCH (resource)<-[:WROTE]-(author:User)',
  notClause: postNotClause,
  withClause: `WITH resource, author,
  [(resource)<-[:COMMENTS]-(comment:Comment) | comment] AS comments,
  [(resource)<-[:SHOUTED]-(user:User) | user] AS shouter`,
  additionalMapping: `, author: properties(author), commentsCount: toString(size(comments)), shoutedCount: toString(size(shouter))`,
  countKeyName: 'postCount',
  resultKeyName: 'posts',
  resultName: 'postResult',
}

const searchUsersSetup = {
  fulltextIndex: 'user_fulltext_search',
  match: 'MATCH (resource)',
  notClause: simpleNotClause,
  withClause: '',
  additionalMapping: '',
  countKeyName: 'userCount',
  resultKeyName: 'users',
  resultName: 'userResult',
}

const searchHashtagsSetup = {
  fulltextIndex: 'tag_fulltext_search',
  match: 'MATCH (resource)',
  notClause: simpleNotClause,
  withClause: '',
  additionalMapping: '',
  countKeyName: 'hashtagCount',
  resultKeyName: 'hashtags',
  resultName: 'hashtagResult',
}

const searchResultPromise = async (session, setup, params) => {
  return session.readTransaction(async (transaction) => {
    return transaction.run(createCypher(setup), params)
  })
}

export default {
  Query: {
    searchPosts: async (_parent, args, context, _resolveInfo) => {
      const { query, postsOffset, firstPosts } = args
      const { id: userId } = context.user

      const session = context.driver.session()
      try {
        const postResults = await searchResultPromise(session, searchPostsSetup, {
          query: queryString(query),
          skip: postsOffset,
          limit: firstPosts,
          userId,
        })
        log(postResults)
        return postResults.records[0].get('postResult')
      } finally {
        session.close()
      }
    },
    searchUsers: async (_parent, args, context, _resolveInfo) => {
      const { query, usersOffset, firstUsers } = args
      const { id: userId } = context.user

      const session = context.driver.session()
      try {
        const userResults = await searchResultPromise(session, searchUsersSetup, {
          query: queryString(query),
          skip: usersOffset,
          limit: firstUsers,
          userId,
        })
        log(userResults)
        return userResults.records[0].get('userResult')
      } finally {
        session.close()
      }
    },
    searchHashtags: async (_parent, args, context, _resolveInfo) => {
      const { query, hashtagsOffset, firstHashtags } = args
      const { id: userId } = context.user

      const session = context.driver.session()
      try {
        const hashtagResults = await searchResultPromise(session, searchHashtagsSetup, {
          query: queryString(query),
          skip: hashtagsOffset,
          limit: firstHashtags,
          userId,
        })
        log(hashtagResults)
        return hashtagResults.records[0].get('hashtagResult')
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
      const tagCypher = `
      CALL db.index.fulltext.queryNodes('tag_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)
      WHERE score >= 0.0
      AND NOT (resource.deleted = true OR resource.disabled = true)
      RETURN resource {.*, __typename: labels(resource)[0]}
      LIMIT $limit
      `

      const myQuery = queryString(query)

      const session = context.driver.session()
      const searchResultPromise = session.readTransaction(async (transaction) => {
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
        const tagTransactionResponse = transaction.run(tagCypher, {
          query: myQuery,
          limit,
        })
        return Promise.all([
          postTransactionResponse,
          userTransactionResponse,
          tagTransactionResponse,
        ])
      })

      try {
        const [postResults, userResults, tagResults] = await searchResultPromise
        log(postResults)
        log(userResults)
        log(tagResults)
        return [...postResults.records, ...userResults.records, ...tagResults.records].map((r) =>
          r.get('resource'),
        )
      } finally {
        session.close()
      }
    },
  },
}
