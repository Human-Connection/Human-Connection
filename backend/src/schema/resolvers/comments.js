import { neo4jgraphql } from 'neo4j-graphql-js'
import { UserInputError } from 'apollo-server'

const COMMENT_MIN_LENGTH = 1
const NO_POST_ERR_MESSAGE = 'Comment cannot be created without a post!'

export default {
  Mutation: {
    CreateComment: async (object, params, context, resolveInfo) => {
      const content = params.content.replace(/<(?:.|\n)*?>/gm, '').trim()
      const { postId } = params
      // Adding relationship from comment to post by passing in the postId,
      // but we do not want to create the comment with postId as an attribute
      // because we use relationships for this. So, we are deleting it from params
      // before comment creation.
      delete params.postId

      if (!params.content || content.length < COMMENT_MIN_LENGTH) {
        throw new UserInputError(`Comment must be at least ${COMMENT_MIN_LENGTH} character long!`)
      }
      if (!postId.trim()) {
        throw new UserInputError(NO_POST_ERR_MESSAGE)
      }

      const session = context.driver.session()
      const postQueryRes = await session.run(
        `
        MATCH (post:Post {id: $postId})
        RETURN post`,
        {
          postId,
        },
      )
      const [post] = postQueryRes.records.map(record => {
        return record.get('post')
      })

      if (!post) {
        throw new UserInputError(NO_POST_ERR_MESSAGE)
      }
      const commentWithoutRelationships = await neo4jgraphql(
        object,
        params,
        context,
        resolveInfo,
        false,
      )

      let transactionRes = await session.run(
        `
        MATCH (post:Post {id: $postId}), (comment:Comment {id: $commentId}), (author:User {id: $userId})
        MERGE (post)<-[:COMMENTS]-(comment)<-[:WROTE]-(author)
        RETURN comment, author`,
        {
          userId: context.user.id,
          postId,
          commentId: commentWithoutRelationships.id,
        },
      )

      const [commentWithAuthor] = transactionRes.records.map(record => {
        return {
          comment: record.get('comment'),
          author: record.get('author'),
        }
      })

      const { comment, author } = commentWithAuthor

      const commentReturnedWithAuthor = {
        ...comment.properties,
        author: author.properties,
      }
      session.close()
      return commentReturnedWithAuthor
    },
    UpdateComment: async (object, params, context, resolveInfo) => {
      await neo4jgraphql(object, params, context, resolveInfo, false)
    },
    DeleteComment: async (object, params, context, resolveInfo) => {
      const comment = await neo4jgraphql(object, params, context, resolveInfo, false)

      return comment
    },
  },
}
