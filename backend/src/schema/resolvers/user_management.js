import encode from '../../jwt/encode'
import bcrypt from 'bcryptjs'
import { AuthenticationError } from 'apollo-server'
import { neode } from '../../bootstrap/neo4j'

const instance = neode()

export default {
  Query: {
    isLoggedIn: (_, args, { driver, user }) => {
      return Boolean(user && user.id)
    },
    currentUser: async (object, params, ctx, resolveInfo) => {
      if (!ctx.user) return null
      const user = await instance.find('User', ctx.user.id)
      return user.toJson()
    },
  },
  Mutation: {
    login: async (_, { email, password }, { driver, req, user }) => {
      // if (user && user.id) {
      //   throw new Error('Already logged in.')
      // }
      const session = driver.session()
      const result = await session.run(
        `
        MATCH (user:User {deleted: false})-[:PRIMARY_EMAIL]->(e:EmailAddress {email: $userEmail})
        RETURN user {.id, .slug, .name, .avatar, .encryptedPassword, .role, .disabled, email:e.email} as user LIMIT 1
      `,
        { userEmail: email },
      )
      session.close()
      const [currentUser] = await result.records.map(record => {
        return record.get('user')
      })

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
    },
    changePassword: async (_, { oldPassword, newPassword }, { driver, user }) => {
      const currentUser = await instance.find('User', user.id)

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
