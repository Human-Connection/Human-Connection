import uuid from 'uuid/v4'
import fileUpload from './fileUpload'

export default {
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
          from: { id: record.get('userFrom').properties.id },
          to: { id: record.get('postTo').properties.id },
          emotion: record.get('emotedRelation').properties.emotion,
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
        RETURN userFrom
        `,
        { from, to, data },
      )
      session.close()
      const [userFrom] = transactionRes.records.map(record => {
        return record.get('userFrom')
      })
      if (!userFrom) throw new Error('Not Authorised!')
      return Boolean(userFrom)
    },
  },
  Query: {
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
}
