import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    CreatePost: async (object, params, ctx, resolveInfo) => {
      const result = await neo4jgraphql(object, params, ctx, resolveInfo, false)

      const session = ctx.driver.session()
      await session.run(
        'MATCH (author:User {id: $userId}), (post:Post {id: $postId}) ' +
        'MERGE (post)<-[:WROTE]-(author) ' +
        'RETURN author', {
          userId: ctx.user.id,
          postId: result.id
        })
      session.close()

      return result
    }

  }
}
