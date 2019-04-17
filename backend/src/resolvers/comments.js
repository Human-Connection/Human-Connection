import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    CreateComment: async (object, params, context, resolveInfo) => {
      const { postId } = params
      delete params.postId
      const comment = await neo4jgraphql(object, params, context, resolveInfo, true)
      
      const session = context.driver.session()

      const transactionRes = await session.run(`
          MATCH (post:Post {id: $postId}), (comment:Comment {id: $commentId})
          MERGE (post)<-[:COMMENTS]-(comment)
          RETURN comment {.id, .content}`, {
          postId,
          commentId: comment.id
        }
      )
      session.close()  
      
      return comment
    }
  }
}
