import { neo4jgraphql } from 'neo4j-graphql-js'
import fileUpload from './fileUpload'
import { neode } from '../../bootstrap/neo4j'
import { UserInputError } from 'apollo-server'

const instance = neode()

const _has = (resolvers, { key, connection }, { returnType }) => {
  return async (parent, params, context, resolveInfo) => {
    if (typeof parent[key] !== 'undefined') return parent[key]
    const { id } = parent
    const statement = `MATCH(u:User {id: {id}})${connection} RETURN related`
    const result = await instance.cypher(statement, { id })
    let response = result.records.map(r => r.get('related').properties)
    if (returnType === 'object') response = response[0] || null
    return response
  }
}

const count = obj => {
  const resolvers = {}
  for (const [key, connection] of Object.entries(obj)) {
    resolvers[key] = async (parent, params, context, resolveInfo) => {
      if (typeof parent[key] !== 'undefined') return parent[key]
      const { id } = parent
      const statement = `
      MATCH(u:User {id: {id}})${connection}
      WHERE NOT related.deleted = true AND NOT related.disabled = true
      RETURN COUNT(DISTINCT(related)) as count
    `
      const result = await instance.cypher(statement, { id })
      const [response] = result.records.map(r => r.get('count').toNumber())
      return response
    }
  }
  return resolvers
}

const undefinedToNull = list => {
  const resolvers = {}
  list.forEach(key => {
    resolvers[key] = async (parent, params, context, resolveInfo) => {
      return typeof parent[key] === 'undefined' ? null : parent[key]
    }
  })
  return resolvers
}

export const hasMany = obj => {
  const resolvers = {}
  for (const [key, connection] of Object.entries(obj)) {
    resolvers[key] = _has(resolvers, { key, connection }, { returnType: 'iterable' })
  }
  return resolvers
}

export const hasOne = obj => {
  const resolvers = {}
  for (const [key, connection] of Object.entries(obj)) {
    resolvers[key] = _has(resolvers, { key, connection }, { returnType: 'object' })
  }
  return resolvers
}

export default {
  Query: {
    User: async (object, args, context, resolveInfo) => {
      return neo4jgraphql(object, args, context, resolveInfo, false)
    },
  },
  Mutation: {
    UpdateUser: async (object, args, context, resolveInfo) => {
      args = await fileUpload(args, { file: 'avatarUpload', url: 'avatar' })
      try {
        let user = await instance.find('User', args.id)
        if (!user) return null
        await user.update(args)
        return user.toJson()
      } catch (e) {
        throw new UserInputError(e.message)
      }
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
    email: async (parent, params, context, resolveInfo) => {
      if (typeof parent.email !== 'undefined') return parent.email
      const { id } = parent
      const statement = `MATCH(u:User {id: {id}})-[:PRIMARY_EMAIL]->(e:EmailAddress) RETURN e`
      const result = await instance.cypher(statement, { id })
      let [{email}]= result.records.map(r => r.get('e').properties)
      return email
    },
    ...undefinedToNull([
      'actorId',
      'avatar',
      'coverImg',
      'deleted',
      'disabled',
      'locationName',
      'about',
    ]),
    ...count({
      contributionsCount: '-[:WROTE]->(related:Post)',
      friendsCount: '<-[:FRIENDS]->(related:User)',
      followingCount: '-[:FOLLOWS]->(related:User)',
      followedByCount: '<-[:FOLLOWS]-(related:User)',
      commentsCount: '-[:WROTE]->(r:Comment)',
      commentedCount: '-[:WROTE]->(:Comment)-[:COMMENTS]->(related:Post)',
      shoutedCount: '-[:SHOUTED]->(related:Post)',
      badgesCount: '<-[:REWARDED]-(related:Badge)',
    }),
    ...hasOne({
      invitedBy: '<-[:INVITED]-(related:User)',
      disabledBy: '<-[:DISABLED]-(related:User)',
    }),
    ...hasMany({
      followedBy: '<-[:FOLLOWS]-(related:User)',
      following: '-[:FOLLOWS]->(related:User)',
      friends: '-[:FRIENDS]-(related:User)',
      blacklisted: '-[:BLACKLISTED]->(related:User)',
      socialMedia: '-[:OWNED]->(related:SocialMedia)',
      contributions: '-[:WROTE]->(related:Post)',
      comments: '-[:WROTE]->(related:Comment)',
      shouted: '-[:SHOUTED]->(related:Post)',
      organizationsCreated: '-[:CREATED_ORGA]->(related:Organization)',
      organizationsOwned: '-[:OWNING_ORGA]->(related:Organization)',
      categories: '-[:CATEGORIZED]->(related:Category)',
      badges: '<-[:REWARDED]-(related:Badge)',
    }),
  },
}
