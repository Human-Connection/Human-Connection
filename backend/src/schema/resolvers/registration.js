import { UserInputError } from 'apollo-server'
import { getNeode } from '../../db/neo4j'
import encryptPassword from '../../helpers/encryptPassword'
import generateNonce from './helpers/generateNonce'
import existingEmailAddress from './helpers/existingEmailAddress'
import normalizeEmail from './helpers/normalizeEmail'
import bcrypt from 'bcryptjs'

const neode = getNeode()

export default {
  Mutation: {
    Signup: async (_parent, args, context) => {
      args.nonce = generateNonce()
      args.email = normalizeEmail(args.email)
      let emailAddress = await existingEmailAddress({ args, context })
      if (emailAddress) return emailAddress
      try {
        emailAddress = await neode.create('EmailAddress', args)
        return emailAddress.toJson()
      } catch (e) {
        throw new UserInputError(e.message)
      }
    },
    SignupVerification: async (_parent, args, context) => {
      const { termsAndConditionsAgreedVersion } = args
      const regEx = new RegExp(/^[0-9]+\.[0-9]+\.[0-9]+$/g)
      if (!regEx.test(termsAndConditionsAgreedVersion)) {
        throw new UserInputError('Invalid version format!')
      }
      args.termsAndConditionsAgreedAt = new Date().toISOString()

      let { nonce, email } = args
      email = normalizeEmail(email)
      delete args.nonce
      delete args.email
      args = encryptPassword(args)

      const { driver } = context
      const session = driver.session()
      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const createUserTransactionResponse = await transaction.run(
          `
            MATCH(email:EmailAddress {nonce: $nonce, email: $email})
            WHERE NOT (email)-[:BELONGS_TO]->()
            CREATE (user:User)
            MERGE(user)-[:PRIMARY_EMAIL]->(email)
            MERGE(user)<-[:BELONGS_TO]-(email)
            SET user += $args
            SET user.id = randomUUID()
            SET user.role = 'user'
            SET user.createdAt = toString(datetime())
            SET user.updatedAt = toString(datetime())
            SET user.allowEmbedIframes = FALSE
            SET user.showShoutsPublicly = FALSE
            SET email.verifiedAt = toString(datetime())
            RETURN user {.*}
          `,
          { args, nonce, email },
        )
        const [user] = createUserTransactionResponse.records.map((record) => record.get('user'))
        if (!user) throw new UserInputError('Invalid email or nonce')
        return user
      })
      try {
        const user = await writeTxResultPromise
        return user
      } catch (e) {
        if (e.code === 'Neo.ClientError.Schema.ConstraintValidationFailed')
          throw new UserInputError('User with this slug already exists!')
        throw new UserInputError(e.message)
      } finally {
        session.close()
      }
    },
    CreateUser: async (_parent, args, context) => {
      args.email = normalizeEmail(args.email)
      args.encryptedNewPassword = await bcrypt.hashSync(args.password, 10)
      args.slug = args.name + '-' + args.lastName
      const emailAddress = await existingEmailAddress({ args, context })
      if (emailAddress) return emailAddress
      const { driver } = context
      const session = driver.session()
      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const createUserTransactionResponse = await transaction.run(
          `
            CREATE (email:EmailAddress {email: $args.email, createdAt: toString(datetime())})
            CREATE (user:User)
            MERGE(user)-[:PRIMARY_EMAIL]->(email)
            MERGE(user)<-[:BELONGS_TO]-(email)
            SET user.name = $args.name
            SET user.lastName = $args.lastName
            SET user.slug = $args.slug
            SET user.disabled = FALSE
            SET user.deleted = FALSE
            SET user.termsAndConditionsAgreedVersion= '0.0.1'
            SET user.termsAndConditionsAgreedAt = toString(datetime())
            SET user.encryptedPassword = $args.encryptedNewPassword
            SET user.id = randomUUID()
            SET user.role = 'user'
            SET user.createdAt = toString(datetime())
            SET user.updatedAt = toString(datetime())
            SET user.allowEmbedIframes = FALSE
            SET user.showShoutsPublicly = FALSE
            RETURN user {.*}
          `,
          { args },
        )
        const [user] = createUserTransactionResponse.records.map((record) => record.get('user'))
        if (!user) throw new UserInputError('Invalid email')
        return user
      })
      try {
        const user = await writeTxResultPromise
        return !!user
      } catch (e) {
        if (e.code === 'Neo.ClientError.Schema.ConstraintValidationFailed')
          throw new UserInputError('User with this slug already exists!')
        throw new UserInputError(e.message)
      } finally {
        session.close()
      }
    },
  },
}
