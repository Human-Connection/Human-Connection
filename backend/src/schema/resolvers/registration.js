import { UserInputError } from 'apollo-server'
import uuid from 'uuid/v4'
import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Mutation: {
    CreateInvitationCode: async (parent, args, context, resolveInfo) => {
      args.token = uuid().substring(0, 6)
      const session = context.driver.session()
      const { user } = context
      let response
      try {
        const cypher = `
        MATCH(u:User {id:$user.id})
        CREATE (ic:InvitationCode {
          id: apoc.create.uuid(),
          createdAt:$args.createdAt,
          token: $args.token
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
      const nonce = uuid().substring(0, 6)
      args.nonce = nonce
      const response = await neo4jgraphql(parent, args, context, resolveInfo, false)
      return { nonce, response }
    },
    CreateSignUpByInvitationCode: async (parent, args, context, resolveInfo) => {
      const { token } = args
      const nonce = uuid().substring(0, 6)
      args.nonce = nonce
      const session = context.driver.session()
      let response
      try {
        let cypher = `MATCH(u:User {email:$args.email}) RETURN u`
        let result = await session.run(cypher, { args })
        const [existingUser] = result.records.map(r => r.get('u'))
        if (existingUser) throw new UserInputError('User account with this email already exists.')
        cypher = `
        MATCH (u:User)-[:GENERATED]->(i:InvitationCode {token:$token})
        WHERE NOT (i)-[:ACTIVATED]->()
        CREATE (s:SignUp {
          id: apoc.create.uuid(),
          createdAt:$args.createdAt,
          nonce: $args.nonce,
          email: $args.email
        })
        MERGE (i)-[a:ACTIVATED]->(s)
        MERGE (u)-[:INVITED]->(s)
        RETURN u,i,a,s`
        result = await session.run(cypher, { args, token })
        const [record] = result.records
        if (!record) throw new UserInputError('Invitation code already used or does not exist.')
        const [inviter, signup] = [record.get('u'), record.get('s')]
        response = signup.properties
        response.invitedBy = inviter.properties
      } catch (e) {
        throw e
      } finally {
        session.close()
      }
      return { nonce, response }
    },
  },
}
