import uuid from 'uuid/v4'
import { neo4jgraphql } from 'neo4j-graphql-js'
import fileUpload from './fileUpload'
import { getBlockedUsers, getBlockedByUsers } from './users.js'
import { mergeWith, isArray } from 'lodash'
import { UserInputError } from 'apollo-server'
import Resolver from './helpers/Resolver'

const filterForBlockedUsers = async (params, context) => {
  if (!context.user) return params
  const [blockedUsers, blockedByUsers] = await Promise.all([
    getBlockedUsers(context),
    getBlockedByUsers(context),
  ])
  const badIds = [...blockedByUsers.map(b => b.id), ...blockedUsers.map(b => b.id)]
  if (!badIds.length) return params

  params.filter = mergeWith(
    params.filter,
    {
      author_not: { id_in: badIds },
    },
    (objValue, srcValue) => {
      if (isArray(objValue)) {
        return objValue.concat(srcValue)
      }
    },
  )
  return params
}

export default {
  Query: {
    Post: async (object, params, context, resolveInfo) => {
      params = await filterForBlockedUsers(params, context)
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
    findPosts: async (object, params, context, resolveInfo) => {
      params = await filterForBlockedUsers(params, context)
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
    PostsEmotionsCountByEmotion: async (object, params, context, resolveInfo) => {
      const session = context.driver.session()
      const { postId, data } = params
      const transactionRes = await session.run(
        `MATCH (post:Post {id: $postId})<-[emoted:EMOTED {emotion: $data.emotion}]-()
        RETURN COUNT(DISTINCT emoted) as emotionsCount
        `,
        { postId, data },
      )
      session.close()

      const [emotionsCount] = transactionRes.records.map(record => {
        return record.get('emotionsCount').low
      })

      return emotionsCount
    },
    PostsEmotionsByCurrentUser: async (object, params, context, resolveInfo) => {
      const session = context.driver.session()
      const { postId } = params
      const transactionRes = await session.run(
        `MATCH (user:User {id: $userId})-[emoted:EMOTED]->(post:Post {id: $postId})
        RETURN collect(emoted.emotion) as emotion`,
        { userId: context.user.id, postId },
      )

      session.close()

      const [emotions] = transactionRes.records.map(record => {
        return record.get('emotion')
      })
      return emotions
    },
  },
  Mutation: {
    CreatePost: async (object, params, context, resolveInfo) => {
      const { categoryIds } = params
      delete params.categoryIds
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      params.id = params.id || uuid()
      let post
      const createPostCypher = `CREATE (post:Post {params})
        SET post.createdAt = datetime()
        WITH post
        MATCH (author:User {id: $userId})
        MERGE (post)<-[:WROTE]-(author)
        WITH post
        UNWIND $categoryIds AS categoryId
        MATCH (category:Category {id: categoryId})
        MERGE (post)-[:CATEGORIZED]->(category)
        RETURN post, toString(post.createdAt) AS postCreatedAt`

      const createPostVariables = { userId: context.user.id, categoryIds, params }

      const session = context.driver.session()
      try {
        const transactionRes = await session.run(createPostCypher, createPostVariables)
        const posts = transactionRes.records.map(record => {
          return {
            ...record.get('post').properties,
            createdAt: { formatted: record.get('postCreatedAt') },
          }
        })
        post = posts[0]
      } catch (e) {
        if (e.code === 'Neo.ClientError.Schema.ConstraintValidationFailed')
          throw new UserInputError('Post with this slug already exists!')
        throw new Error(e)
      } finally {
        session.close()
      }

      return post
    },
    UpdatePost: async (object, params, context, resolveInfo) => {
      const { categoryIds } = params
      delete params.categoryIds
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      const session = context.driver.session()

      let updatePostCypher = `MATCH(post: Post { id: $params.id })
      SET post = $params
            `

      if (categoryIds && categoryIds.length) {
        const cypherDeletePreviousRelations = `
          MATCH(post: Post { id: $params.id }) - [previousRelations: CATEGORIZED] -> (category: Category)
        DELETE previousRelations
        RETURN post, category
          `

        await session.run(cypherDeletePreviousRelations, { params })

        updatePostCypher += `WITH post
        UNWIND $categoryIds AS categoryId
        MATCH(category: Category { id: categoryId })
        MERGE(post) - [: CATEGORIZED] -> (category)
          `
      }

      updatePostCypher += `RETURN post`
      const updatePostVariables = { categoryIds, params }

      const transactionRes = await session.run(updatePostCypher, updatePostVariables)
      const [post] = transactionRes.records.map(record => {
        return record.get('post')
      })

      session.close()

      return post.properties
    },

    DeletePost: async (object, args, context, resolveInfo) => {
      const session = context.driver.session()
      // we cannot set slug to 'UNAVAILABE' because of unique constraints
      const transactionRes = await session.run(
        `
        MATCH(post: Post { id: $postId })
        OPTIONAL MATCH(post) < -[: COMMENTS] - (comment: Comment)
        SET post.deleted = TRUE
        SET post.content = 'UNAVAILABLE'
        SET post.contentExcerpt = 'UNAVAILABLE'
        SET post.title = 'UNAVAILABLE'
        SET comment.deleted = TRUE
        REMOVE post.image
        RETURN post
          `,
        { postId: args.id },
      )
      const [post] = transactionRes.records.map(record => record.get('post').properties)
      return post
    },
    AddPostEmotions: async (object, params, context, resolveInfo) => {
      const session = context.driver.session()
      const { to, data } = params
      const { user } = context
      const transactionRes = await session.run(
        `MATCH(userFrom: User { id: $user.id }), (postTo: Post { id: $to.id
  })
  MERGE(userFrom)- [emotedRelation: EMOTED { emotion: $data.emotion }] -> (postTo)
RETURN userFrom, postTo, emotedRelation`,
        { user, to, data },
      )
      session.close()
      const [emoted] = transactionRes.records.map(record => {
        return {
          from: { ...record.get('userFrom').properties },
          to: { ...record.get('postTo').properties },
          ...record.get('emotedRelation').properties,
        }
      })
      return emoted
    },
    RemovePostEmotions: async (object, params, context, resolveInfo) => {
      const session = context.driver.session()
      const { to, data } = params
      const { id: from } = context.user
      const transactionRes = await session.run(
        `MATCH(userFrom: User { id: $from }) - [emotedRelation: EMOTED { emotion: $data.emotion }] -> (postTo: Post { id: $to.id })
DELETE emotedRelation
RETURN userFrom, postTo`,
        { from, to, data },
      )
      session.close()
      const [emoted] = transactionRes.records.map(record => {
        return {
          from: { ...record.get('userFrom').properties },
          to: { ...record.get('postTo').properties },
          emotion: data.emotion,
        }
      })
      return emoted
    },
  },
  Post: {
    ...Resolver('Post', {
      undefinedToNull: ['activityId', 'objectId', 'image', 'language'],
      hasMany: {
        tags: '-[:TAGGED]->(related:Tag)',
        categories: '-[:CATEGORIZED]->(related:Category)',
        comments: '<-[:COMMENTS]-(related:Comment)',
        shoutedBy: '<-[:SHOUTED]-(related:User)',
        emotions: '<-[related:EMOTED]',
      },
      hasOne: {
        author: '<-[:WROTE]-(related:User)',
        disabledBy: '<-[:DISABLED]-(related:User)',
      },
      count: {
        commentsCount:
          '<-[:COMMENTS]-(related:Comment) WHERE NOT related.deleted = true AND NOT related.disabled = true',
        shoutedCount:
          '<-[:SHOUTED]-(related:User) WHERE NOT related.deleted = true AND NOT related.disabled = true',
        emotionsCount: '<-[related:EMOTED]-(:User)',
      },
      boolean: {
        shoutedByCurrentUser:
          'MATCH(this)<-[:SHOUTED]-(related:User {id: $cypherParams.currentUserId}) RETURN COUNT(related) >= 1',
      },
    }),
    relatedContributions: async (parent, params, context, resolveInfo) => {
      if (typeof parent.relatedContributions !== 'undefined') return parent.relatedContributions
      const { id } = parent
      const statement = `
        MATCH(p: Post { id: $id }) - [: TAGGED | CATEGORIZED] -> (categoryOrTag) < -[: TAGGED | CATEGORIZED] - (post: Post)
        WHERE NOT post.deleted AND NOT post.disabled
        RETURN DISTINCT post
        LIMIT 10
          `
      let relatedContributions
      const session = context.driver.session()
      try {
        const result = await session.run(statement, { id })
        relatedContributions = result.records.map(r => r.get('post').properties)
      } finally {
        session.close()
      }
      return relatedContributions
    },
  },
}
