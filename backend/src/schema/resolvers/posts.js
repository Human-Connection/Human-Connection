import Neode from 'neode'
import { neo4jgraphql } from 'neo4j-graphql-js'
import fileUpload from './fileUpload'
import util from 'util'
import graphqlFields from 'graphql-fields'

const instance = new Neode('bolt://localhost:7687', 'neo4j', 'letmein')
instance.model('Post', {
  id: {
    primary: true,
    type: 'uuid',
    required: true,
  },
  activityId: {
    type: 'string',
  },
  objectId: {
    type: 'string',
  },
  title: {
    type: 'string',
    required: true,
  },
  slug: {
    type: 'string',
  },
  content: {
    type: 'string',
    required: true,
  },
  contentExcerpt: {
    type: 'string',
  },
  image: {
    type: 'string',
  },
  visibility: {
    type: 'string',
    allow: ['public', 'friends', 'private'],
  },
  deleted: {
    type: 'boolean',
  },
  disabled: {
    type: 'boolean',
  },
  createdAt: {
    type: 'datetime',
  },
  updatedAt: {
    type: 'datetime',
  },
})

// tags: [Tag]! @relation(name: "TAGGED", direction: "OUT")
// categories: [Category]! @relation(name: "CATEGORIZED", direction: "OUT")
// comments: [Comment]! @relation(name: "COMMENTS", direction: "IN")
// shoutedBy: [User]! @relation(name: "SHOUTED", direction: "IN")
// author: User @relation(name: "WROTE", direction: "IN")
// disabledBy: User @relation(name: "DISABLED", direction: "IN")
instance.model('Post').relationship('tags', 'relationship', 'TAGGED', 'out', 'Tag')
instance.model('Post').relationship('categories', 'relationship', 'CATEGORIZED', 'out', 'Category')
instance.model('Post').relationship('comments', 'relationship', 'COMMENTS', 'out', 'Comment')
instance.model('Post').relationship('shoutedBy', 'relationship', 'SHOUTED', 'in', 'User')
instance.model('Post').relationship('author', 'relationship', 'WROTE', 'in', 'User')
instance.model('Post').relationship('disabledBy', 'relationship', 'DISABLED', 'in', 'User')

instance.model('User', {
  id: {
    primary: true,
    type: 'uuid',
    required: true,
  },
  actorId: {
    type: 'string',
  },
  name: {
    type: 'string',
  },
  email: {
    type: 'string',
    required: true,
  },
  slug: {
    type: 'string',
  },
  password: {
    type: 'string',
    required: true,
  },
  avatar: {
    type: 'string',
  },
  coverImg: {
    type: 'string',
  },
  deleted: {
    type: 'boolean',
  },
  disabled: {
    type: 'boolean',
  },
  publicKey: {
    type: 'string',
  },
  privateKey: {
    type: 'string',
  },

  wasInvited: {
    type: 'boolean',
  },
  wasSeeded: {
    type: 'boolean',
  },

  locationName: {
    type: 'string',
  },
  about: {
    type: 'string',
  },

  createdAt: {
    type: 'datetime',
  },
  updatedAt: {
    type: 'datetime',
  },
})

// Not to be in model
// commentsCount: Int! @cypher(statement: "MATCH (this)<-[:COMMENTS]-(r:Comment) WHERE NOT r.deleted = true AND NOT r.disabled = true  RETURN COUNT(r)")
// shoutedCount: Int! @cypher(statement: "MATCH (this)<-[:SHOUTED]-(r:User) WHERE NOT r.deleted = true AND NOT r.disabled = true RETURN COUNT(DISTINCT r)")
// # Has the currently logged in user shouted that post?
// shoutedByCurrentUser: Boolean! @cypher(
//   statement: """
//     MATCH (this)<-[:SHOUTED]-(u:User {id: $cypherParams.currentUserId})
//     RETURN COUNT(u) >= 1
//   """
// )
// imageUpload: Upload
// relatedContributions: [Post]! @cypher(
//   statement: """
//     MATCH (this)-[:TAGGED|CATEGORIZED]->(categoryOrTag)<-[:TAGGED|CATEGORIZED]-(post:Post)
//     RETURN DISTINCT post
//     LIMIT 10
//   """
// )
const query = instance.query()

/* const resolver = {
  /* Post: async ({ fields }) => {
    if (fields.author) {
      query
        .match('post')
        .relationship('WROTE', 'IN')
        .to('author', 'User')
      await resolver.User(fields.author)
    }
    if (fields.commentsCount) {
      query
        .match('post')
        .relationship('COMMENTS', 'IN')
        .to('r', 'Comment')
        .whereNot('r.deleted', true)
        .whereNot('r.disabled', true)
    }
  }, 
  Post: {
    author: async ({ fields }) => {
      query
        .match('post')
        .relationship('WROTE', 'IN')
        .to('author', 'User')
      await resolver.User(fields)
    },
    commentsCount: async ({ fields }) => {
      query
        .match('post')
        .relationship('COMMENTS', 'IN')
        .to('r', 'Comment')
        .whereNot('r.deleted', true)
        .whereNot('r.disabled', true)
    },
  },
  User: async () => {},
} */

const resolverUser = {
  self: async () => {
    return {}
  },
}

const resolverPost = {
  __self: async ({ fields, params }) => {
    query
      .match('post', 'Post')
      .where('post.deleted', params.deleted)
      .where('post.disabled', params.disabled)
    return {
      post: 'post',
      ...(await resolve({ fields, resolver: resolverPost })),
    }
  },
  author: async ({ fields }) => {
    query
      .match('post')
      .relationship('WROTE', 'IN')
      .to('postauthor', 'User')
    return {
      postauthor: 'postauthor',
      ...(await resolve({ fields, resolver: resolverUser })),
    }
  },
  commentsCount: async ({ fields }) => {
    query
      .match('post')
      .relationship('COMMENTS', 'IN')
      .to('postcommentscount', 'Comment')
      .whereNot('postcommentscount.deleted', true)
      .whereNot('postcommentscount.disabled', true)
    return {
      postcommentscount: 'COUNT(postcommentscount)',
    }
  },
}

const resolve = async ({ fields, resolver, params }) => {
  let returns = {}
  for (const [name, subfields] of Object.entries(fields)) {
    if (resolver[name]) {
      returns = {
        ...returns,
        ...(await resolver[name]({ fields: subfields, params })),
      }
    }
  }
  return returns
}

export default {
  Query: {
    findPosts: async (parent, params, context, resolveInfo) => {
      throw new Error('not implemented findPosts')
      /*
      findPosts(filter: String!, limit: Int = 10): [Post]! @cypher(
    statement: """
      CALL db.index.fulltext.queryNodes('full_text_search', $filter)
      YIELD node as post, score
      MATCH (post)<-[:WROTE]-(user:User)
      WHERE score >= 0.2
      AND NOT user.deleted = true AND NOT user.disabled = true
      AND NOT post.deleted = true AND NOT post.disabled = true
      RETURN post
      LIMIT $limit
    """
  )
  */
    },
    /* User: async (parent, { first, offset, deleted, disabled }, context, resolveInfo) => {
    } */
    Post: async (parent, params, context, resolveInfo) => {
      // find all query fields
      const fields = graphqlFields(resolveInfo)
      // call handler for every field present in resolver
      const returns = await resolve({ fields: { __self: fields }, resolver: resolverPost, params })
      // console.log(returns)

      query
        .return(returns.post, returns.postauthor, returns.postcommentscount) // TODO variable return depending on fields
        .skip(params.offset)
        .limit(params.first)
      // console.log(query.build())
      // const { bquery, bparams } = query.build()
      const result = await query.execute()
      // console.log(util.inspect(result, false, null, true))
      // console.log(util.inspect(result.records, false, null, true))
      // console.log(util.inspect(result.records, false, null, true))
      // console.log(util.inspect(instance, false, null, true))
      // console.log(result)
      // throw new Error('not implemented Post')
      const res1 = await instance.hydrateFirst(result, returns.post, instance.model('Post'))
      console.log(res1._properties)
      const res2 = await instance.hydrateFirst(result, returns.postauthor, instance.model('User'))
      console.log(res2._properties)
      // const res3 = await instance.hydrateFirst(result, returns.postcommentscount)
      const res3 = result.records[0]._fields[2].low
      console.log(res3)
      const resFinal = [
        {
          ...Object.fromEntries(res1._properties),
          commentsCount: res3,
          categories: [], // TODO
          shoutedCount: 0, // TODO
          author: {
            ...Object.fromEntries(res2._properties),
            contributionsCount: 0, // TODO
            shoutedCount: 0, // TODO
            commentsCount: 0, // TODO
            location: null, // TODO
            followedByCount: 0, // TODO
            followedByCurrentUser: false, // TODO
            badges: [], // TODO
          },
        },
      ]
      console.log(resFinal)
      // throw new Error('not implemented Post')
      return resFinal
      /* const resUser = res2._properties
      resUser.set('contributionsCount', 0)
      resUser.set('shoutedCount', 0)
      resUser.set('commentsCount', 0)
      resUser.set('location', null)
      resUser.set('followedByCount', 0)
      resUser.set('followedByCurrentUser', false)
      resUser.set('badges', [])
      const resFinal = res1._properties
      resFinal.set('commentsCount', res3)
      resFinal.set('categories', [])
      resFinal.set('shoutedCount', 0)
      resFinal.set('author', resUser) */

      console.log(resFinal)
      throw new Error('not implemented Post')
      return resFinal
      // throw new Error('not implemented Post')
      // const a = await instance.hydrate(result, returns.post)
      // console.log(util.inspect(a, false, null, true))
      // const b = await instance.hydrate(result, returns.postauthor)
      // console.log(util.inspect(b, false, null, true))
      // const c = await instance.hydrate(result, returns.postcommentscount)
      // console.log(util.inspect(c, false, null, true))
      let resX = result.records.map(record => {
        return {
          ...record._fields[0].properties,
          commentsCount: record._fieldLookup[returns.postcommentscount],
          categories: [], // TODO
          shoutedCount: 0, // TODO
          author: {
            ...record._fields[1].properties,
            contributionsCount: 0, // TODO
            shoutedCount: 0, // TODO
            commentsCount: 0, // TODO
            location: null, // TODO
            followedByCount: 0, // TODO
            followedByCurrentUser: false, // TODO
            badges: [], // TODO
          },
        }
      })
      // throw new Error('not implemented Post')
      return resX
      // return instance.model('Post').all({}, {}, first, offset)
      // console.log(object, params, context, resolveInfo)
    },
  },
  Mutation: {
    DeletePost: async (object, params, context, resolveInfo) => {
      throw new Error('not implemented DeletePost')
    },
    UpdatePost: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      throw new Error('not implemented UpdatePost')
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },

    CreatePost: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      throw new Error('not implemented CreatePost')
      const result = await neo4jgraphql(object, params, context, resolveInfo, false)

      const session = context.driver.session()
      await session.run(
        'MATCH (author:User {id: $userId}), (post:Post {id: $postId}) ' +
          'MERGE (post)<-[:WROTE]-(author) ' +
          'RETURN author',
        {
          userId: context.user.id,
          postId: result.id,
        },
      )
      session.close()

      return result
    },
  },
}
