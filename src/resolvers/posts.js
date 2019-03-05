import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
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
        })
      session.close()

      return result
    }
  }
}
