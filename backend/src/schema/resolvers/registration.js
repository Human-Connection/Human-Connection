import { UserInputError } from 'apollo-server'
import { neode } from '../../bootstrap/neo4j'
import fileUpload from './fileUpload'
import encryptPassword from '../../helpers/encryptPassword'
import generateNonce from './helpers/generateNonce'
import existingEmailAddress from './helpers/existingEmailAddress'

const instance = neode()

export default {
  Mutation: {
    CreateInvitationCode: async (_parent, args, context, _resolveInfo) => {
      args.token = generateNonce()
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
    Signup: async (_parent, args, context) => {
      const nonce = generateNonce()
      args.nonce = nonce
      let emailAddress = await existingEmailAddress(_parent, args, context)
      if (emailAddress) return emailAddress
      try {
        emailAddress = await instance.create('EmailAddress', args)
        return emailAddress.toJson()
      } catch (e) {
        throw new UserInputError(e.message)
      }
    },
    SignupByInvitation: async (_parent, args, context) => {
      const { token } = args
      const nonce = generateNonce()
      args.nonce = nonce
      let emailAddress = await existingEmailAddress(_parent, args, context)
      if (emailAddress) return emailAddress
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
        emailAddress = await instance.create('EmailAddress', args)
        await validInvitationCode.relateTo(emailAddress, 'activated')
        return emailAddress.toJson()
      } catch (e) {
        throw new UserInputError(e)
      }
    },
    SignupVerification: async (_parent, args) => {
      const { termsAndConditionsAgreedVersion } = args
      const regEx = new RegExp(/^[0-9]+\.[0-9]+\.[0-9]+$/g)
      if (!regEx.test(termsAndConditionsAgreedVersion)) {
        throw new UserInputError('Invalid version format!')
      }
      args.termsAndConditionsAgreedAt = new Date().toISOString()

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
        if (e.code === 'Neo.ClientError.Schema.ConstraintValidationFailed')
          throw new UserInputError('User with this slug already exists!')
        throw new UserInputError(e.message)
      }
    },
  },
}
