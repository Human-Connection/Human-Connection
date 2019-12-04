import uuid from 'uuid/v4'
import Resolver from './helpers/Resolver'

export default {
  Mutation: {
    CreateComment: async (object, params, context, resolveInfo) => {
      const { postId } = params
      // Adding relationship from comment to post by passing in the postId,
      // but we do not want to create the comment with postId as an attribute
      // because we use relationships for this. So, we are deleting it from params
      // before comment creation.
      delete params.postId
      params.id = params.id || uuid()

      const session = context.driver.session()
      try {
        const createCommentCypher = `
        MATCH (post:Post {id: $postId})
        MATCH (author:User {id: $userId})
        WITH post, author
        CREATE (comment:Comment {params})
        SET comment.createdAt = toString(datetime())
        SET comment.updatedAt = toString(datetime())
        MERGE (post)<-[:COMMENTS]-(comment)<-[:WROTE]-(author)
        RETURN comment
      `
        const transactionRes = await session.run(createCommentCypher, {
          userId: context.user.id,
          postId,
          params,
        })

        const [comment] = transactionRes.records.map(record => record.get('comment').properties)

        return comment
      } finally {
        session.close()
      }
    },
    UpdateComment: async (_parent, params, context, _resolveInfo) => {
      const session = context.driver.session()
      try {
        const updateCommentCypher = `
        MATCH (comment:Comment {id: $params.id})
        SET comment += $params
        SET comment.updatedAt = toString(datetime())
        RETURN comment
      `
        const transactionRes = await session.run(updateCommentCypher, { params })
        const [comment] = transactionRes.records.map(record => record.get('comment').properties)
        return comment
      } finally {
        session.close()
      }
    },
    DeleteComment: async (_parent, args, context, _resolveInfo) => {
      const session = context.driver.session()
      try {
        const transactionRes = await session.run(
          `
        MATCH (comment:Comment {id: $commentId})
        SET comment.deleted        = TRUE
        SET comment.content        = 'UNAVAILABLE'
        SET comment.contentExcerpt = 'UNAVAILABLE'
        RETURN comment
      `,
          { commentId: args.id },
        )
        const [comment] = transactionRes.records.map(record => record.get('comment').properties)
        return comment
      } finally {
        session.close()
      }
    },
  },
  Comment: {
    ...Resolver('Comment', {
      hasOne: {
        author: '<-[:WROTE]-(related:User)',
        post: '-[:COMMENTS]->(related:Post)',
      },
    }),
  },
}
