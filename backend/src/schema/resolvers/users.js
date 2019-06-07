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
      const { resource } = params
      const session = context.driver.session()

      if (resource && resource.length) {
        await Promise.all(
          resource.map(async node => {
            await session.run(
              `
            MATCH (resource:${node})<-[:WROTE]-(author:User {id: $userId})
            DETACH DELETE resource
            RETURN author`,
              {
                userId: context.user.id,
              },
            )
          }),
        )
        session.close()
      }
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
  },
}
