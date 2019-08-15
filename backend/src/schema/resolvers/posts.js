import uuid from 'uuid/v4'
import { neo4jgraphql } from 'neo4j-graphql-js'
import fileUpload from './fileUpload'
import { getBlockedUsers, getBlockedByUsers } from './users.js'
import { mergeWith, isArray } from 'lodash'

const filterForBlockedUsers = async (params, context) => {
  if (!context.user) return params
  const [blockedUsers, blockedByUsers] = await Promise.all([
    getBlockedUsers(context),
    getBlockedByUsers(context),
  ])
  const badIds = [...blockedByUsers.map(b => b.id), ...blockedUsers.map(b => b.id)]
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
    UpdatePost: async (object, params, context, resolveInfo) => {
      const { categoryIds } = params
      delete params.categoryIds
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      const session = context.driver.session()
      const cypherDeletePreviousRelations = `
        MATCH (post:Post { id: $params.id })-[previousRelations:CATEGORIZED]->(category:Category)
        DELETE previousRelations
        RETURN post, category
      `

      await session.run(cypherDeletePreviousRelations, { params })

      let updatePostCypher = `MATCH (post:Post {id: $params.id})
      SET post = $params
      `
      if (categoryIds && categoryIds.length) {
        updatePostCypher += `WITH post
        UNWIND $categoryIds AS categoryId
        MATCH (category:Category {id: categoryId})
        MERGE (post)-[:CATEGORIZED]->(category)
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

    CreatePost: async (object, params, context, resolveInfo) => {
      const { categoryIds } = params
      delete params.categoryIds
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      params.id = params.id || uuid()

      let createPostCypher = `CREATE (post:Post {params})
      WITH post
      MATCH (author:User {id: $userId})
      MERGE (post)<-[:WROTE]-(author)
      `
      if (categoryIds) {
        createPostCypher += `WITH post
        UNWIND $categoryIds AS categoryId
        MATCH (category:Category {id: categoryId})
        MERGE (post)-[:CATEGORIZED]->(category)
        `
      }
      createPostCypher += `RETURN post`
      const createPostVariables = { userId: context.user.id, categoryIds, params }

      const session = context.driver.session()
      const transactionRes = await session.run(createPostCypher, createPostVariables)

      const [post] = transactionRes.records.map(record => {
        return record.get('post')
      })

      session.close()

      return post.properties
    },
    AddPostEmotions: async (object, params, context, resolveInfo) => {
      const session = context.driver.session()
      const { to, data } = params
      const { user } = context
      const transactionRes = await session.run(
        `MATCH (userFrom:User {id: $user.id}), (postTo:Post {id: $to.id})
        MERGE (userFrom)-[emotedRelation:EMOTED {emotion: $data.emotion}]->(postTo)
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
        `MATCH (userFrom:User {id: $from})-[emotedRelation:EMOTED {emotion: $data.emotion}]->(postTo:Post {id: $to.id})
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
}
