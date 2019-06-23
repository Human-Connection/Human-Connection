import encode from '../../jwt/encode'
import bcrypt from 'bcryptjs'
import { AuthenticationError, UserInputError } from 'apollo-server'
import { neo4jgraphql } from 'neo4j-graphql-js'

const registration = async ({ args, driver }) => {
  const createdAt = new Date().toISOString()
  const updatedAt = new Date().toISOString()
  const { email } = args
  const session = driver.session()
  let result
  try {
    result = await session.run(
      `
      CREATE (user:User {
        id: apoc.create.uuid(),
        email:$email,
        createdAt:$createdAt,
        updatedAt:$updatedAt,
        deleted: false,
        disabled: false,
        isVerified: false
        })
      RETURN user
      `,
      { email, createdAt, updatedAt },
    )
  } catch (e) {
    if (e.message.match(/already exists/g)) {
      throw new UserInputError('User account with this email already exists.')
    } else {
      throw e
    }
  } finally {
    session.close()
  }
  return result
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
    invite: async (_, args, { user: inviter, driver }) => {
      const result = await registration({ args, driver })

      const session = driver.session()
      try {
        const {
          records: [record],
        } = result
        const { id: userId } = record.get('user').properties
        await session.run(
          `
            MATCH (inviter:User {id:$inviterId})
            MATCH (user:User {id:$userId})
            MERGE (inviter)-[:INVITED]->(user)
          `,
          { inviterId: inviter.id, userId },
        )
      } catch (e) {
        throw e
      } finally {
        session.close()
      }
      return true
    },
    signup: async (_, args, { driver }) => {
      const result = await registration({ args, driver })
      return !!result
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
      const [currentUser] = await result.records.map(record => {
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
