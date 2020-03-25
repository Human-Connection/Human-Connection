import encode from '../../jwt/encode'
import bcrypt from 'bcryptjs'
import { AuthenticationError } from 'apollo-server'
import { getNeode } from '../../db/neo4j'
import normalizeEmail from './helpers/normalizeEmail'
import log from './helpers/databaseLogger'

const neode = getNeode()

export default {
  Query: {
    isLoggedIn: (_, args, { driver, user }) => {
      return Boolean(user && user.id)
    },
    currentUser: async (object, params, context, resolveInfo) => {
      const { user, driver } = context
      if (!user) return null
      const session = driver.session()
      const currentUserTransactionPromise = session.readTransaction(async (transaction) => {
        const result = await transaction.run(
          `
            MATCH (user:User {id: $id})
            WITH user, [(user)<-[:OWNED_BY]-(medium:SocialMedia) | properties(medium) ] as media
            RETURN user {.*, socialMedia: media } as user
          `,
          { id: user.id },
        )
        log(result)
        return result.records.map((record) => record.get('user'))
      })
      try {
        const [currentUser] = await currentUserTransactionPromise
        return currentUser
      } finally {
        session.close()
      }
    },
  },
  Mutation: {
    login: async (_, { email, password }, { driver, req, user }) => {
      // if (user && user.id) {
      //   throw new Error('Already logged in.')
      // }
      email = normalizeEmail(email)
      const session = driver.session()
      try {
        const loginReadTxResultPromise = session.readTransaction(async (transaction) => {
          const loginTransactionResponse = await transaction.run(
            `
              MATCH (user:User {deleted: false})-[:PRIMARY_EMAIL]->(e:EmailAddress {email: $userEmail})
              RETURN user {.id, .slug, .name, .encryptedPassword, .role, .disabled, email:e.email} as user LIMIT 1
            `,
            { userEmail: email },
          )
          log(loginTransactionResponse)
          return loginTransactionResponse.records.map((record) => record.get('user'))
        })
        const [currentUser] = await loginReadTxResultPromise
        if (
          currentUser &&
          (await bcrypt.compareSync(password, currentUser.encryptedPassword)) &&
          !currentUser.disabled
        ) {
          delete currentUser.encryptedPassword
          return encode(currentUser)
        } else if (currentUser && currentUser.disabled) {
          throw new AuthenticationError('Your account has been disabled.')
        } else {
          throw new AuthenticationError('Incorrect email address or password.')
        }
      } finally {
        session.close()
      }
    },
    changePassword: async (_, { oldPassword, newPassword }, { driver, user }) => {
      const currentUser = await neode.find('User', user.id)

      const encryptedPassword = currentUser.get('encryptedPassword')
      if (!(await bcrypt.compareSync(oldPassword, encryptedPassword))) {
        throw new AuthenticationError('Old password is not correct')
      }

      if (await bcrypt.compareSync(newPassword, encryptedPassword)) {
        throw new AuthenticationError('Old password and new password should be different')
      }

      const newEncryptedPassword = await bcrypt.hashSync(newPassword, 10)
      await currentUser.update({
        encryptedPassword: newEncryptedPassword,
        updatedAt: new Date().toISOString(),
      })

      return encode(await currentUser.toJson())
    },
  },
}
