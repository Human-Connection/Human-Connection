import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    CreateSocialMedia: async (object, params, context, resolveInfo) => {
      /**
       * TODO?: Creates double Nodes!
       */
      const socialMedia = await neo4jgraphql(object, params, context, resolveInfo, false)
      const session = context.driver.session()
      await session.run(
        `MATCH (owner:User {id: $userId}), (socialMedia:SocialMedia {id: $socialMediaId})
        MERGE (socialMedia)<-[:OWNED]-(owner) 
        RETURN owner`,
        {
          userId: context.user.id,
          socialMediaId: socialMedia.id,
        },
      )
      session.close()

      return socialMedia
    },
    DeleteSocialMedia: async (object, params, context, resolveInfo) => {
      const socialMedia = await neo4jgraphql(object, params, context, resolveInfo, false)

      return socialMedia
    },
  },
}
