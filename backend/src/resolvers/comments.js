import { neo4jgraphql } from 'neo4j-graphql-js'
import { UserInputError } from 'apollo-server'

const COMMENT_MIN_LENGTH = 1
export default {
  Mutation: {
    CreateComment: async (object, params, context, resolveInfo) => {
      const content = params.content.replace(/<(?:.|\n)*?>/gm, '').trim()

      if (!params.content || content.length < COMMENT_MIN_LENGTH) {
        throw new UserInputError(`Comment must be at least ${COMMENT_MIN_LENGTH} character long!`)
      }
      const { postId } = params
      const comment = await neo4jgraphql(object, params, context, resolveInfo, false)

      const session = context.driver.session()

      await session.run(`
        MATCH (author:User {id: $userId}), (comment:Comment {id: $commentId})
        MERGE (comment)<-[:WROTE]-(author)
        RETURN author`, {
        userId: context.user.id,
        commentId: comment.id
      }
      )
      await session.run(`
        MATCH (post:Post {id: $postId}), (comment:Comment {id: $commentId})
        MERGE (post)<-[:COMMENTS]-(comment)
        RETURN post`, {
        postId,
        commentId: comment.id
      }
      )
      session.close()

      return comment
    }
  }
}
