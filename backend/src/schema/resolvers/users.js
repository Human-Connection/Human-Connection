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
      const cypher = 'CREATE (user:User {params}) RETURN user'
      const session = context.driver.session()
      let response
      try {
        const result = await session.run(cypher, { params })
        const [user] = result.records.map(r => r.get('user'))
        response = user.properties
      } catch(e) {
        throw(e)
      } finally {
        session.close()
      }
      return response
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
            SET resource.deleted = true
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
  User: {
    followedBy: async (parent, params, context, resolveInfo) => {
      console.log('parent', parent)
      // if (parent.followedBy) return parent.followedBy
      const { id } = parent
      const cypher = 'MATCH (user:User {id: $id})<-[:FOLLOWS]-(follower:User) RETURN follower'
      const session = context.driver.session()
      let response
      try {
        const result = await session.run(cypher, { id })
        const followers = result.records.map(r => r.get('follower'))
        response = followers.map(f => f.properties)
        console.log('response', response)
      } catch(e) {
        throw(e)
      } finally {
        session.close()
      }
      return response
    },
  }
}
