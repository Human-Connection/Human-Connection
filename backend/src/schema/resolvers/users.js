import { neo4jgraphql } from 'neo4j-graphql-js'
import fileUpload from './fileUpload'
import bcrypt from 'bcryptjs'
import { neode } from '../../bootstrap/neo4j'
import { UserInputError } from 'apollo-server'


export const createUser = async ({ args }) => {
  args.password = await bcrypt.hashSync(args.password, 10)
  const instance = neode()
  try {
    const user = await instance.create('User', args)
    return user.properties()
  } catch(e) {
    throw new UserInputError(e.message)
  }
}

export default {
  Mutation: {
    UpdateUser: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'avatarUpload', url: 'avatar' })
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
    CreateUser: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'avatarUpload', url: 'avatar' })
      return createUser({ args: params })
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
      if (parent.followedBy) return parent.followedBy
      const { id } = parent
      const cypher = 'MATCH (user:User {id: $id})<-[:FOLLOWS]-(follower:User) RETURN follower'
      const session = context.driver.session()
      let response
      try {
        const result = await session.run(cypher, { id })
        const followers = result.records.map(r => r.get('follower'))
        response = followers.map(f => f.properties)
      } catch (e) {
        throw e
      } finally {
        session.close()
      }
      return response
    },
  },
}
