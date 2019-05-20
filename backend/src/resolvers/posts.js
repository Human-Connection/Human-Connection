import { neo4jgraphql } from 'neo4j-graphql-js'
import fileUpload from './fileUpload'

export default {
  Mutation: {
    UpdatePost: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'imageUpload', url: 'image'})
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },

    CreatePost: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'imageUpload', url: 'image'})
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
