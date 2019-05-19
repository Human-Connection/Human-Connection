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
        throw new UserInputError(
          `Comment must be at least ${COMMENT_MIN_LENGTH} character long!`
        )
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
          postId
        }
      )
      const [post] = postQueryRes.records.map(record => {
        return record.get('post')
      })

      if (!post) {
        throw new UserInputError(NO_POST_ERR_MESSAGE)
      }

      const comment = await neo4jgraphql(
        object,
        params,
        context,
        resolveInfo,
        false
      )

      await session.run(
        `
        MATCH (post:Post {id: $postId}), (comment:Comment {id: $commentId}), (author:User {id: $userId})
        MERGE (post)<-[:COMMENTS]-(comment)<-[:WROTE]-(author)
        RETURN post`,
        {
          userId: context.user.id,
          postId,
          commentId: comment.id
        }
      )
      session.close()

      return comment
    },
    UpdateComment: async (object, params, context, resolveInfo) => {
      // Strip element tags and remove leading/trailing white spaces from content
      const content = params.content.replace(/<(?:.|\n)*?>/gm, '').trim()
      const { id } = params
      // Check length of content
      if (!params.content || content.length < COMMENT_MIN_LENGTH) {
        throw new UserInputError(
          `Comment must be at least ${COMMENT_MIN_LENGTH} character long!`
        )
      }

      // Check if comment exists
      const session = context.driver.session()
      const commentQueryRes = await session.run(
        `
        MATCH (comment: Comment { id:$id}) 
        RETURN comment`,
        {
          id
        }
      )

      // Destructure content from session results array
      const [comment] = commentQueryRes.records.map(record => {
        const a = record.get('comment')
        console.log(a)
        return record.get('comment')
      })

      // Send error message if cannot find a matching comment.
      if (!comment) {
        throw new UserInputError(NO_COMMENT_ERR_MESSAGE)
      }

      // Update comment.
      const commentRev = await neo4jgraphql(
        object,
        params,
        context,
        resolveInfo,
        false
      )

      await session.run(
        `
        MATCH (comment: Comment { id:$id}) 
        SET comment.content = 'bbb'
        `,
        {
          id,
          content
        }
      )
      session.close()

      return commentRev
    }
  }
}
