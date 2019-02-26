import encode from '../jwt/encode'
import { fixUrl } from '../middleware/fixImageUrlsMiddleware'
import bcrypt from 'bcryptjs'
import { AuthenticationError } from 'apollo-server'

export default {
  Query: {
    isLoggedIn: (parent, args, { driver, user }) => {
      return Boolean(user && user.id)
    },
    currentUser: (parent, args, { user }) => {
      return user
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
      return session.run(
        'MATCH (user:User {email: $userEmail}) ' +
        'RETURN user {.id, .slug, .name, .avatar, .email, .password, .role} as user LIMIT 1', {
          userEmail: email
        })
        .then(async (result) => {
          session.close()
          const [currentUser] = await result.records.map(function (record) {
            return record.get('user')
          })

          if (currentUser && await bcrypt.compareSync(password, currentUser.password)) {
            delete currentUser.password
            currentUser.avatar = fixUrl(currentUser.avatar)
            return Object.assign(currentUser, {
              token: encode(currentUser)
            })
          } else throw new AuthenticationError('Incorrect email address or password.')
        })
    }
  }
}
