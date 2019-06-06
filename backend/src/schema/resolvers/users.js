import { neo4jgraphql } from 'neo4j-graphql-js'
import fileUpload from './fileUpload'

export default {
  Mutation: {
    UpdateUser: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'avatarUpload', url: 'avatar' })
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
    CreateUser: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'avatarUpload', url: 'avatar' })
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
    DeleteUser: async (object, params, context, resolveInfo) => {
      const { comments, posts } = params
      const session = context.driver.session()
      if (comments) {
        await session.run(
          `
          MATCH (comments:Comment)<-[:WROTE]-(author:User {id: $userId}) 
          DETACH DELETE comments
          RETURN author`,
          {
            userId: context.user.id,
          },
        )
      }
      if (posts) {
        await session.run(
          `
          MATCH (posts:Post)<-[:WROTE]-(author:User {id: $userId}) 
          DETACH DELETE posts
          RETURN author`,
          {
            userId: context.user.id,
          },
        )
      }
      session.close()
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
  },
}
