import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    CreateSocialMedia: async (object, params, context, resolveInfo) => {
      const result = await neo4jgraphql(object, params, context, resolveInfo, true)

      const session = context.driver.session()
      await session.run(
        'MATCH (owner:User {id: $userId}), (socialMedia:SocialMedia {id: $socialMediaId}) ' +
        'MERGE (socialMedia)<-[:OWNED]-(owner) ' +
        'RETURN owner', {
          userId: context.user.id,
          socialMediaId: result.id
        }
      )
      session.close()

      return result
    }
  }
}
