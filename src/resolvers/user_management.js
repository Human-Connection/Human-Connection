import encode from '../jwt/encode'
import bcrypt from 'bcryptjs'
import { AuthenticationError } from 'apollo-server'
import { neo4jgraphql } from 'neo4j-graphql-js'

export default {
  Query: {
    isLoggedIn: (parent, args, { driver, user }) => {
      return Boolean(user && user.id)
    },
    currentUser: async (object, params, ctx, resolveInfo) => {
      const { user } = ctx
      if (!user) return null
      return neo4jgraphql(object, { id: user.id }, ctx, resolveInfo, false)
    }
  },
  Mutation: {
    signup: async (parent, { email, password }, { req }) => {
      // if (data[email]) {
      //   throw new Error('Another User with same email exists.')
      // }
      // data[email] = {
      //   password: await bcrypt.hashSync(password, 10),
      // }

      return true
    },
    login: async (parent, { email, password }, { driver, req, user }) => {
      // if (user && user.id) {
      //   throw new Error('Already logged in.')
      // }
      const session = driver.session()
      const result = await session.run(
        'MATCH (user:User {email: $userEmail}) ' +
          'RETURN user {.id, .slug, .name, .avatar, .email, .password, .role, .disabled} as user LIMIT 1',
        {
          userEmail: email
        }
      )

      session.close()
      const [currentUser] = await result.records.map(function (record) {
        return record.get('user')
      })

      if (
        currentUser &&
        (await bcrypt.compareSync(password, currentUser.password)) &&
        currentUser.disabled == false
      ) {
        delete currentUser.password
        return encode(currentUser)
      } 
      else if (currentUser && 
        currentUser.disabled
      ){
        throw new AuthenticationError('Your account has been disabled.')
      }
      else {
        throw new AuthenticationError('Incorrect email address or password.')
      }
    },
    changePassword: async (
      _,
      { oldPassword, newPassword },
      { driver, user }
    ) => {
      const session = driver.session()
      let result = await session.run(
        `MATCH (user:User {email: $userEmail}) 
         RETURN user {.id, .email, .password}`,
        {
          userEmail: user.email
        }
      )

      const [currentUser] = result.records.map(function (record) {
        return record.get('user')
      })

      if (!(await bcrypt.compareSync(oldPassword, currentUser.password))) {
        throw new AuthenticationError('Old password is not correct')
      }

      if (await bcrypt.compareSync(newPassword, currentUser.password)) {
        throw new AuthenticationError(
          'Old password and new password should be different'
        )
      } else {
        const newHashedPassword = await bcrypt.hashSync(newPassword, 10)
        session.run(
          `MATCH (user:User {email: $userEmail})
           SET user.password = $newHashedPassword
           RETURN user
        `,
          {
            userEmail: user.email,
            newHashedPassword
          }
        )
        session.close()

        return encode(currentUser)
      }
    }
  }
}
