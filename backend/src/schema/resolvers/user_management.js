import encode from '../../jwt/encode'
import bcrypt from 'bcryptjs'
import { AuthenticationError } from 'apollo-server'
import { cypherMutation, neo4jgraphql } from 'neo4j-graphql-js'

const registration = async (args, driver) => {
  const createdAt = new Date().toISOString()
  const updatedAt = new Date().toISOString()
  const params = { ...args, createdAt, updatedAt }
  const session = driver.session()
  try {
    const result = await session.run(`
        CREATE (user:User {
          id: apoc.create.uuid(),
          name: NULL,
          email:$params.email,
          password: NULL,
          actorId:$params.actorId,
          createdAt:$params.createdAt,
          slug:$params.slug,
          disabled:$params.disabled,
          deleted:$params.deleted,
          isVerified: false
          })
        `, { params })
  } catch(error) {
    return false
  }
  return true
}

export default {
  Query: {
    isLoggedIn: (_, args, { driver, user }) => {
      return Boolean(user && user.id)
    },
    currentUser: async (object, params, ctx, resolveInfo) => {
      const { user } = ctx
      if (!user) return null
      return neo4jgraphql(object, { id: user.id }, ctx, resolveInfo, false)
    },
  },
  Mutation: {
    invite: async (_, args, { driver }) => {
      return registration(args, driver)
    },
    signup: async (_, args, { driver }) => {
      return registration(args, driver)
    },
    login: async (_, { email, password }, { driver, req, user }) => {
      // if (user && user.id) {
      //   throw new Error('Already logged in.')
      // }
      const session = driver.session()
      const result = await session.run(
        'MATCH (user:User {email: $userEmail}) ' +
          'RETURN user {.id, .slug, .name, .avatar, .email, .password, .role, .disabled} as user LIMIT 1',
        {
          userEmail: email,
        },
      )

      session.close()
      const [currentUser] = await result.records.map(function(record) {
        return record.get('user')
      })

      if (
        currentUser &&
        (await bcrypt.compareSync(password, currentUser.password)) &&
        !currentUser.disabled
      ) {
        delete currentUser.password
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
         RETURN user {.id, .email, .password}`,
        {
          userEmail: user.email,
        },
      )

      const [currentUser] = result.records.map(function(record) {
        return record.get('user')
      })

      if (!(await bcrypt.compareSync(oldPassword, currentUser.password))) {
        throw new AuthenticationError('Old password is not correct')
      }

      if (await bcrypt.compareSync(newPassword, currentUser.password)) {
        throw new AuthenticationError('Old password and new password should be different')
      } else {
        const newHashedPassword = await bcrypt.hashSync(newPassword, 10)
        session.run(
          `MATCH (user:User {email: $userEmail})
           SET user.password = $newHashedPassword
           RETURN user
        `,
          {
            userEmail: user.email,
            newHashedPassword,
          },
        )
        session.close()

        return encode(currentUser)
      }
    },
  },
}
