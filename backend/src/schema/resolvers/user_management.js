import encode from '../../jwt/encode'
import bcrypt from 'bcryptjs'
import { AuthenticationError } from 'apollo-server'
import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Query: {
    isLoggedIn: (_, args, { driver, user }) => {
      return Boolean(user && user.id)
    },
    currentUser: async (object, params, ctx, resolveInfo) => {
      const { user } = ctx
      if (!user) return null
      return neo4jgraphql(object, { id: user.id }, ctx, resolveInfo, true)
    },
  },
  Mutation: {
    login: async (_, { email, password }, { driver, req, user }) => {
      // if (user && user.id) {
      //   throw new Error('Already logged in.')
      // }
      const session = driver.session()
      const result = await session.run(
        'MATCH (user:User {email: $userEmail}) ' +
          'RETURN user {.id, .slug, .name, .avatar, .email, .encryptedPassword, .role, .disabled} as user LIMIT 1',
        {
          userEmail: email,
        },
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
      const session = driver.session()
      let result = await session.run(
        `MATCH (user:User {email: $userEmail})
         RETURN user {.id, .email, .encryptedPassword}`,
        {
          userEmail: user.email,
        },
      )

      const [currentUser] = result.records.map(function(record) {
        return record.get('user')
      })

      if (!(await bcrypt.compareSync(oldPassword, currentUser.encryptedPassword))) {
        throw new AuthenticationError('Old password is not correct')
      }

      if (await bcrypt.compareSync(newPassword, currentUser.encryptedPassword)) {
        throw new AuthenticationError('Old password and new password should be different')
      } else {
        const newEncryptedPassword = await bcrypt.hashSync(newPassword, 10)
        session.run(
          `MATCH (user:User {email: $userEmail})
           SET user.encryptedPassword = $newEncryptedPassword
           RETURN user
        `,
          {
            userEmail: user.email,
            newEncryptedPassword,
          },
        )
        session.close()

        return encode(currentUser)
      }
    },
  },
}
