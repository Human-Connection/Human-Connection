import { ForbiddenError, UserInputError } from 'apollo-server'
import uuid from 'uuid/v4'
import { neode } from '../../bootstrap/neo4j'
import fileUpload from './fileUpload'
import encryptPassword from '../../helpers/encryptPassword'

const instance = neode()

/*
 * TODO: remove this function as soon type `User` has no `email` property
 * anymore
 */
const checkEmailDoesNotExist = async ({ email }) => {
  email = email.toLowerCase()
  const emails = await instance.all('EmailAddress', { email })
  if (emails.length > 0) throw new UserInputError('User account with this email already exists.')
}

export default {
  Mutation: {
    CreateInvitationCode: async (_parent, args, context, _resolveInfo) => {
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
    Signup: async (_parent, args, _context, _resolveInfo) => {
      const nonce = uuid().substring(0, 6)
      args.nonce = nonce
      await checkEmailDoesNotExist({ email: args.email })
      try {
        const emailAddress = await instance.create('EmailAddress', args)
        return emailAddress.toJson()
      } catch (e) {
        throw new UserInputError(e.message)
      }
    },
    SignupByInvitation: async (_parent, args, _context, _resolveInfo) => {
      const { token } = args
      const nonce = uuid().substring(0, 6)
      args.nonce = nonce
      await checkEmailDoesNotExist({ email: args.email })
      try {
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
        return emailAddress.toJson()
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    SignupVerification: async (_parent, args, _context, _resolveInfo) => {
      const { termsAndConditionsAgreedVersion } = args
      const regEx = new RegExp(/^[0-9]+\.[0-9]+\.[0-9]+$/g)
      if (!regEx.test(termsAndConditionsAgreedVersion)) {
        throw new ForbiddenError('Invalid version format!')
      }

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
