import { neo4jgraphql } from 'neo4j-graphql-js'
import uuid from 'uuid/v4'
import fileUpload from './fileUpload'
import bcrypt from 'bcryptjs'

export const createUser = async ({ args, driver }) => {
  args.id = args.id || uuid()
  args.password = await bcrypt.hashSync(args.password, 10)
  args.deleted = args.deleted || false
  args.disabled = args.disabled || false
  const cypher = 'CREATE (user:User {args}) RETURN user'
  const session = driver.session()
  let response
  try {
    const result = await session.run(cypher, { args })
    const [user] = result.records.map(r => r.get('user'))
    response = user.properties
  } catch (e) {
    throw e
  } finally {
    session.close()
  }
  return response
}

export default {
  Mutation: {
    UpdateUser: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'avatarUpload', url: 'avatar' })
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
    CreateUser: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'avatarUpload', url: 'avatar' })
      return createUser({ args: params, driver: context.driver })
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
