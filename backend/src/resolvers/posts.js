import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    CreatePost: async (object, params, context, resolveInfo) => {
      const result = await neo4jgraphql(object, params, context, resolveInfo, false)

      const session = context.driver.session()
      await session.run(
        'MATCH (author:User {id: $userId}), (post:Post {id: $postId}) ' +
        'MERGE (post)<-[:WROTE]-(author) ' +
        'RETURN author', {
          userId: context.user.id,
          postId: result.id
        }
      )
      session.close()

      return result
    },
    UpdatePost: async (object, params, context, resolveInfo) => {
      const session = context.driver.session()
      // first delete WROTE relationship and after the update add it again
      // this is needed because otherwise there would be 2 WROTE relations in the database
      await session.run(
        'MATCH (u:User)-[rel:WROTE]->(p:Post) WHERE p.id = $id delete rel', {
          id: params.id
        }
      )
      const result = await neo4jgraphql(object, params, context, resolveInfo, false)
      await session.run(
        'MATCH (u:User), (p:Post) WHERE p.id = $id AND u.slug = $slug CREATE (u)-[:WROTE]->(p)', {
          id: params.id,
          slug: context.user.slug
        }
      )
      session.close()

      return result
    }
  }
}
