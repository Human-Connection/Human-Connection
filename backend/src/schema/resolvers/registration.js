import { UserInputError } from 'apollo-server'
import uuid from 'uuid/v4'
import { neode } from '../../bootstrap/neo4j'

const instance = neode()

/*
 * TODO: remove this function as soon type `User` has no `email` property
 * anymore
 */
const checkEmailDoesNotExist = async ({ email }) => {
  email = email.toLowerCase()
  const users = await instance.all('User', { email })
  if (users.length > 0) throw new UserInputError('User account with this email already exists.')
}

export default {
  Mutation: {
    CreateInvitationCode: async (parent, args, context, resolveInfo) => {
      args.token = uuid().substring(0, 6)
      const {
        user: { id: userId },
      } = context
      let response
      try {
        const [user, invitationCode] = await Promise.all([
          instance.find('User', userId),
          instance.create('InvitationCode', args),
        ])
        await invitationCode.relateTo(user, 'generatedBy')
        response = invitationCode.toJson()
        response.generatedBy = user.toJson()
      } catch (e) {
        throw new UserInputError(e)
      }
      return response
    },
    Signup: async (parent, args, context, resolveInfo) => {
      const nonce = uuid().substring(0, 6)
      args.nonce = nonce
      try {
        await checkEmailDoesNotExist({ email: args.email })
        const emailAddress = await instance.create('EmailAddress', args)
        return { response: emailAddress.toJson(), nonce }
      } catch (e) {
        throw new UserInputError(e.message)
      }
    },
    SignupByInvitation: async (parent, args, context, resolveInfo) => {
      const { token } = args
      const nonce = uuid().substring(0, 6)
      args.nonce = nonce
      try {
        await checkEmailDoesNotExist({ email: args.email })
        const result = await instance.cypher(
          `
        MATCH (invitationCode:InvitationCode {token:{token}})
        WHERE NOT (invitationCode)-[:ACTIVATED]->()
        RETURN invitationCode
        `,
          { token },
        )
        const validInvitationCode = instance.hydrateFirst(
          result,
          'invitationCode',
          instance.model('InvitationCode'),
        )
        if (!validInvitationCode)
          throw new UserInputError('Invitation code already used or does not exist.')
        const emailAddress = await instance.create('EmailAddress', args)
        await validInvitationCode.relateTo(emailAddress, 'activated')
        return { response: emailAddress.toJson(), nonce }
      } catch (e) {
        throw new UserInputError(e)
      }
    },
  },
}
