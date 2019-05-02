import { neo4jgraphql, cypherQuery } from 'neo4j-graphql-js'
import { v1 as neo4j } from 'neo4j-driver'
import _ from 'lodash'

export function extractQueryResult ({ records }, returnType) {
  const variableName = 'post'
  let result = null
  result = records.map(record => record.get(variableName))
  // handle Integer fields
  result = _.cloneDeepWith(result, field => {
    if (neo4j.isInt(field)) {
      // See: https://neo4j.com/docs/api/javascript-driver/current/class/src/v1/integer.js~Integer.html
      return field.inSafeRange() ? field.toNumber() : field.toString()
    }
  })
  return result
}

export default {
  Query: {
    Post: async (object, params, context, resolveInfo) => {
      let [query, cypherParams] = cypherQuery(params, context, resolveInfo)

      // HACK-ATTACK
      query = query.replace('RETURN', 'WITH `post` ORDER BY `post`.createdAt DESC RETURN')

      const session = context.driver.session()
      let result
      try {
        result = await session.readTransaction(tx => {
          return tx.run(query, cypherParams)
        })
        result = extractQueryResult(result, resolveInfo.returnType)
      } finally {
        session.close()
      }

      return result
    }
  },
  Mutation: {
    CreatePost: async (object, params, context, resolveInfo) => {
      const result = await neo4jgraphql(object, params, context, resolveInfo, false)

      const session = context.driver.session()
      await session.run(
        'MATCH (author:User {id: $userId}), (post:Post {id: $postId}) ' +
        'MERGE (post)<-[:WROTE]-(author) ' +
        'RETURN author', {
          userId: context.user.id,
          postId: result.id
        }
      )
      session.close()

      return result
    }
  }
}
