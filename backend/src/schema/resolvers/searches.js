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

const postWhereClause = `WHERE score >= 0.0
  AND NOT (
    author.deleted = true OR author.disabled = true
    OR resource.deleted = true OR resource.disabled = true
    OR (:User {id: $userId})-[:MUTED]->(author)
  )`

const searchPostsSetup = {
  fulltextIndex: 'post_fulltext_search',
  match: 'MATCH (resource:Post)<-[:WROTE]-(author:User)',
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
}

const searchUsersSetup = {
  fulltextIndex: 'user_fulltext_search',
  match: 'MATCH (resource:User)',
  whereClause: simpleWhereClause,
  withClause: '',
  returnClause: 'resource {.*, __typename: labels(resource)[0]}',
  limit: 'LIMIT $limit',
}

const searchHashtagsSetup = {
  fulltextIndex: 'tag_fulltext_search',
  match: 'MATCH (resource:Tag)',
  whereClause: simpleWhereClause,
  withClause: '',
  returnClause: 'resource {.*, __typename: labels(resource)[0]}',
  limit: 'LIMIT $limit',
}

const countSetup = {
  returnClause: 'toString(size(collect(resource)))',
  limit: '',
}

const countUsersSetup = {
  ...searchUsersSetup,
  ...countSetup,
}
const countPostsSetup = {
  ...searchPostsSetup,
  ...countSetup,
}
const countHashtagsSetup = {
  ...searchHashtagsSetup,
  ...countSetup,
}

const searchResultPromise = async (session, setup, params) => {
  return session.readTransaction(async (transaction) => {
    return transaction.run(cypherTemplate(setup), params)
  })
}

const searchResultCallback = (result) => {
  return result.records.map((r) => r.get('result'))
}

const countResultCallback = (result) => {
  return result.records[0].get('result')
}

const getSearchResults = async (context, setup, params, resultCallback = searchResultCallback) => {
  const session = context.driver.session()
  try {
    const results = await searchResultPromise(session, setup, params)
    log(results)
    return resultCallback(results)
  } finally {
    session.close()
  }
}

const multiSearchMap = [
  { symbol: '!', setup: searchPostsSetup, resultName: 'posts' },
  { symbol: '@', setup: searchUsersSetup, resultName: 'users' },
  { symbol: '#', setup: searchHashtagsSetup, resultName: 'hashtags' },
]

export default {
  Query: {
    searchPosts: async (_parent, args, context, _resolveInfo) => {
      const { query, postsOffset, firstPosts } = args
      const { id: userId } = context.user

      return {
        postCount: getSearchResults(
          context,
          countPostsSetup,
          {
            query: queryString(query),
            skip: 0,
            userId,
          },
          countResultCallback,
        ),
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
        userCount: getSearchResults(
          context,
          countUsersSetup,
          {
            query: queryString(query),
            skip: 0,
          },
          countResultCallback,
        ),
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
        hashtagCount: getSearchResults(
          context,
          countHashtagsSetup,
          {
            query: queryString(query),
            skip: 0,
          },
          countResultCallback,
        ),
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

      const searchType = query.replace(/^([!@#]?).*$/, '$1')
      const searchString = query.replace(/^([!@#])/, '')

      const params = {
        query: queryString(searchString),
        skip: 0,
        limit,
        userId,
      }

      if (searchType === '')
        return [
          ...(await getSearchResults(context, searchPostsSetup, params)),
          ...(await getSearchResults(context, searchUsersSetup, params)),
          ...(await getSearchResults(context, searchHashtagsSetup, params)),
        ]

      params.limit = 15
      const type = multiSearchMap.find((obj) => obj.symbol === searchType)
      return getSearchResults(context, type.setup, params)
    },
  },
}
