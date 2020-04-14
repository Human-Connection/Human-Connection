import log from './helpers/databaseLogger'
import { queryString } from './searches/queryString'

// see http://lucene.apache.org/core/8_3_1/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#package.description

const cypherTemplate = (setup) => `
  CALL db.index.fulltext.queryNodes('${setup.fulltextIndex}', $query)
  YIELD node AS resource, score
  ${setup.match}
  ${setup.whereClause}
  ${setup.withClause}
  RETURN 
  ${setup.returnClause}
  AS result
  SKIP $skip
  ${setup.limit}
`

const simpleWhereClause =
  'WHERE score >= 0.0 AND NOT (resource.deleted = true OR resource.disabled = true)'

const postWhereClause = `WHERE score >= 0.0 AND NOT (
    author.deleted = true OR author.disabled = true
    OR resource.deleted = true OR resource.disabled = true
    OR (:User {id: $userId})-[:MUTED]->(author)
  )`

const searchPostsSetup = {
  fulltextIndex: 'post_fulltext_search',
  match: 'MATCH (resource)<-[:WROTE]-(author:User)',
  whereClause: postWhereClause,
  withClause: `WITH resource, author,
  [(resource)<-[:COMMENTS]-(comment:Comment) | comment] AS comments,
  [(resource)<-[:SHOUTED]-(user:User) | user] AS shouter`,
  returnClause: `resource {
    .*,
    __typename: labels(resource)[0],
    author: properties(author),
    commentsCount: toString(size(comments)),
    shoutedCount: toString(size(shouter))
  }`,
  limit: 'LIMIT $limit',
  countKeyName: 'postCount',
  resultKeyName: 'posts',
}

const searchUsersSetup = {
  fulltextIndex: 'user_fulltext_search',
  match: 'MATCH (resource)',
  whereClause: simpleWhereClause,
  withClause: '',
  returnClause: 'resource {.*, __typename: labels(resource)[0]}',
  limit: 'LIMIT $limit',
  countKeyName: 'userCount',
  resultKeyName: 'users',
}

const searchHashtagsSetup = {
  fulltextIndex: 'tag_fulltext_search',
  match: 'MATCH (resource)',
  whereClause: simpleWhereClause,
  withClause: '',
  returnClause: 'resource {.*, __typename: labels(resource)[0]}',
  limit: 'LIMIT $limit',
  countKeyName: 'hashtagCount',
  resultKeyName: 'hashtags',
}

const countUsersSetup = {
  ...searchUsersSetup,
  ...{
    returnClause: 'toString(size(collect(resource)))',
    limit: '',
  },
}
const countPostsSetup = {
  ...searchPostsSetup,
  ...{
    returnClause: 'toString(size(collect(resource)))',
    limit: '',
  },
}
const countHashtagsSetup = {
  ...searchHashtagsSetup,
  ...{
    returnClause: 'toString(size(collect(resource)))',
    limit: '',
  },
}

const searchResultPromise = async (session, setup, params) => {
  return session.readTransaction(async (transaction) => {
    return transaction.run(cypherTemplate(setup), params)
  })
}

const getSearchResults = async (context, setup, params) => {
  const session = context.driver.session()
  try {
    const results = await searchResultPromise(session, setup, params)
    log(results)
    return results.records.map((r) => r.get('result'))
  } finally {
    session.close()
  }
}

const countSearchResults = async (context, setup, params) => {
  const session = context.driver.session()
  try {
    const results = await searchResultPromise(session, setup, params)
    log(results)
    return results.records[0].get('result')
  } finally {
    session.close()
  }
}

/*
const multiSearchMap = [
  { symbol: '!', setup: searchPostsSetup, resultName: 'posts' },
  { symbol: '@', setup: searchUsersSetup, resultName: 'users' },
  { symbol: '#', setup: searchHashtagsSetup, resultName: 'hashtags' },
] */

export default {
  Query: {
    searchPosts: async (_parent, args, context, _resolveInfo) => {
      const { query, postsOffset, firstPosts } = args
      // const { id: userId } = context.user
      const userId = '73'

      return {
        postCount: countSearchResults(context, countPostsSetup, {
          query: queryString(query),
          skip: 0,
          userId,
        }),
        posts: getSearchResults(context, searchPostsSetup, {
          query: queryString(query),
          skip: postsOffset,
          limit: firstPosts,
          userId,
        }),
      }
    },
    searchUsers: async (_parent, args, context, _resolveInfo) => {
      const { query, usersOffset, firstUsers } = args
      return {
        userCount: countSearchResults(context, countUsersSetup, {
          query: queryString(query),
          skip: 0,
        }),
        users: getSearchResults(context, searchUsersSetup, {
          query: queryString(query),
          skip: usersOffset,
          limit: firstUsers,
        }),
      }
    },
    searchHashtags: async (_parent, args, context, _resolveInfo) => {
      const { query, hashtagsOffset, firstHashtags } = args
      return {
        hashtagCount: countSearchResults(context, countHashtagsSetup, {
          query: queryString(query),
          skip: 0,
        }),
        hashtags: getSearchResults(context, searchHashtagsSetup, {
          query: queryString(query),
          skip: hashtagsOffset,
          limit: firstHashtags,
        }),
      }
    },
    searchResults: async (_parent, args, context, _resolveInfo) => {
      const { query, limit } = args
      const { id: userId } = context.user

      // const searchType = query.replace(/^([!@#]?).*$/, '$1')
      // const searchString = query.replace(/^([!@#])/, '')

      /*
      const params = {
        query: queryString(searchString),
        skip: 0,
        limit,
        userId,
      } */

      const postCypher = `
      CALL db.index.fulltext.queryNodes('post_fulltext_search', $query)
      YIELD node as resource, score
      MATCH (resource)<-[:WROTE]-(author:User)
      WHERE score >= 0.0
      AND NOT (
        author.deleted = true OR author.disabled = true
        OR resource.deleted = true OR resource.disabled = true
        OR (:User {id: $userId})-[:MUTED]->(author)
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
          userId,
        })
        const userTransactionResponse = transaction.run(userCypher, {
          query: myQuery,
          limit,
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
