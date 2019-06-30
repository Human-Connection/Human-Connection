import { UserInputError } from 'apollo-server'
import uuid from 'uuid/v4'
import { neode } from '../../bootstrap/neo4j'
import { hashSync } from 'bcryptjs'
import fileUpload from './fileUpload'

const instance = neode()

export const encryptPassword = args => {
  args.encryptedPassword = hashSync(args.password, 10)
  delete args.password
  return args
}

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
    SignupVerification: async (object, args, context, resolveInfo) => {
      let { nonce, email } = args
      email = email.toLowerCase()
      const result = await instance.cypher(
        `
      MATCH(email:EmailAddress {nonce: {nonce}, email: {email}})
      WHERE NOT (email)-[:BELONGS_TO]->()
      RETURN email
      `,
        { nonce, email },
      )
      const emailAddress = await instance.hydrateFirst(result, 'email', instance.model('Email'))
      if (!emailAddress) throw new UserInputError('Invalid email or nonce')
      args = await fileUpload(args, { file: 'avatarUpload', url: 'avatar' })
      args = await encryptPassword(args)
      try {
        const user = await instance.create('User', args)
        await Promise.all([
          user.relateTo(emailAddress, 'primaryEmail'),
          emailAddress.relateTo(user, 'belongsTo'),
          emailAddress.update({ verifiedAt: new Date().toISOString() }),
        ])
        return user.toJson()
      } catch (e) {
        throw new UserInputError(e.message)
      }
    },
  },
}
