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
      let comment
      const createCommentCypher = `
        CREATE (comment:Comment {params})
        SET comment.createdAt = datetime()
        WITH comment
        MATCH (post:Post {id: $postId}), (author:User {id: $userId})
        MERGE (post)<-[:COMMENTS]-(comment)<-[:WROTE]-(author)
        RETURN comment, toString(comment.createdAt) AS commentCreatedAt`

      const createCommentVariables = { userId: context.user.id, postId, params }
      const session = context.driver.session()
      try {
        const transactionRes = await session.run(createCommentCypher, createCommentVariables)
        const comments = transactionRes.records.map(record => {
          return {
            ...record.get('comment').properties,
            createdAt: { formatted: record.get('commentCreatedAt') },
          }
        })
        comment = comments[0]
      } finally {
        session.close()
      }

      return comment
    },
    DeleteComment: async (object, args, context, resolveInfo) => {
      const session = context.driver.session()
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
    },
  },
  Comment: {
    ...Resolver('Comment', {
      hasOne: {
        author: '<-[:WROTE]-(related:User)',
        post: '-[:COMMENTS]->(related:Post)',
        disabledBy: '<-[:DISABLED]-(related:User)',
      },
    }),
  },
}
