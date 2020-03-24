import { v4 as uuid } from 'uuid'
import Resolver from './helpers/Resolver'

export default {
  Mutation: {
    CreateComment: async (object, params, context, resolveInfo) => {
      const { postId } = params
      const { user, driver } = context
      // Adding relationship from comment to post by passing in the postId,
      // but we do not want to create the comment with postId as an attribute
      // because we use relationships for this. So, we are deleting it from params
      // before comment creation.
      delete params.postId
      params.id = params.id || uuid()

      const session = driver.session()

      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const createCommentTransactionResponse = await transaction.run(
          ` 
            MATCH (post:Post {id: $postId})
            MATCH (author:User {id: $userId})
            WITH post, author
            CREATE (comment:Comment $params)
            SET comment.createdAt = toString(datetime())
            SET comment.updatedAt = toString(datetime())
            MERGE (post)<-[:COMMENTS]-(comment)<-[:WROTE]-(author)
            RETURN comment
          `,
          { userId: user.id, postId, params },
        )
        return createCommentTransactionResponse.records.map(
          (record) => record.get('comment').properties,
        )
      })
      try {
        const [comment] = await writeTxResultPromise
        return comment
      } finally {
        session.close()
      }
    },
    UpdateComment: async (_parent, params, context, _resolveInfo) => {
      const session = context.driver.session()
      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const updateCommentTransactionResponse = await transaction.run(
          ` 
            MATCH (comment:Comment {id: $params.id})
            SET comment += $params
            SET comment.updatedAt = toString(datetime())
            RETURN comment
          `,
          { params },
        )
        return updateCommentTransactionResponse.records.map(
          (record) => record.get('comment').properties,
        )
      })
      try {
        const [comment] = await writeTxResultPromise
        return comment
      } finally {
        session.close()
      }
    },
    DeleteComment: async (_parent, args, context, _resolveInfo) => {
      const session = context.driver.session()
      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const deleteCommentTransactionResponse = await transaction.run(
          ` 
            MATCH (comment:Comment {id: $commentId})
            SET comment.deleted        = TRUE
            SET comment.content        = 'UNAVAILABLE'
            SET comment.contentExcerpt = 'UNAVAILABLE'
            RETURN comment
          `,
          { commentId: args.id },
        )
        return deleteCommentTransactionResponse.records.map(
          (record) => record.get('comment').properties,
        )
      })
      try {
        const [comment] = await writeTxResultPromise
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
