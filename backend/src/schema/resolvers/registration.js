import { cypherMutation } from 'neo4j-graphql-js'
import uuid from 'uuid/v4'

export default {
  Mutation: {
    CreateInvitationCode: async (parent, args, context, resolveInfo) => {
      args.nonce = uuid().substring(0, 6)
      const session = context.driver.session()
      const { user } = context
      let response
      try {
        const cypher = `MATCH(u:User {id:$user.id})
                        CREATE (ic:InvitationCode {
                          id: apoc.create.uuid(),
                          createdAt:$args.createdAt,
                          nonce:$args.nonce
                        })
                        MERGE (u)-[g:GENERATED]->(ic)
                        RETURN u,g,ic`
        const result = await session.run(cypher, { args, user })
        let [[ic, u]] = result.records.map(r => [r.get('ic'), r.get('u')])
        response = ic.properties
        response.generatedBy = u.properties
      } catch (e) {
        throw e
      } finally {
        session.close()
      }
      return response
    },
    CreateSignUp: async (parent, args, context, resolveInfo) => {
      const { nonce } = args
      const session = context.driver.session()
      let response
      try {
        const mutation = `
          MATCH(i:InvitationCode {nonce:$nonce}) WHERE NOT (i)-[:ACTIVATED]->()
          CREATE (s:SignUp {
            id: apoc.create.uuid(),
            createdAt:$args.createdAt,
          })
          MERGE (i)-[a:ACTIVATED]->(s)
          RETURN i,a,s
        `
        const [invitation] = await tx.run(cypher, args).records.map(r => r.get('i'))
        if (!invitation) tx.rollback()
      } catch (e) {
        throw e
      } finally {
        session.close()
      }
      return signup
    },
  },
}
