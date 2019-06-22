import gql from 'graphql-tag'
import { GraphQLClient, request } from 'graphql-request'
import jwt from 'jsonwebtoken'
import CONFIG from './../../config'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'

const factory = Factory()
let client
let variables

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('signup', () => {
  const mutation = `mutation($email: String!) { signup(email: $email) }`
  let action = () => {
    return client.request(mutation, variables)
  }
  beforeEach(() => {
    client = new GraphQLClient(host)
  })

  describe('given an invalid email', () => {
    beforeEach(() => {
      variables = { email: 'someUser' }
    })

    it('throws `Invalid email`', async () => {
      await expect(action()).rejects.toThrow('Invalid email')
    })

    it('creates no user account', async () => {
      await action()
      const userQuery = `{ User { createdAt } }`
      await expect(client.request(userQuery)).resolves.toEqual({User: []})
    })
  })

  describe('given a valid email', () => {
    beforeEach(() => {
      variables = { email: 'someUser@example.org' }
    })

    it('resolves', async () => {
      await expect(action()).resolves.toEqual({signup: true})
    })

    it('creates a user account with a `createdAt` attribute', async () => {
      await action()
      const userQuery = `{ User { createdAt } }`
      const { User: [user] } = await client.request(userQuery)
      expect(user.createdAt).toBeTruthy()
      expect(user.createdAt).toBe(expect.any(String))
    })
  })
})

describe('invite', () => {
  const mutation = `mutation($email: String!) { invite(email: $email) }`
  let userParams

  it('throws Authorization error', async () => {
    const client = new GraphQLClient(host)
    await expect(client.request(mutation, { email: 'blah@example.org' }))
      .rejects.toThrow('Not Authorised!')
  })

  describe('authenticated', () => {
    let action = async () => {
      const factory = Factory()
      await factory.create('User', userParams)
      const headers = await login(userParams)
      const authenticatedClient = new GraphQLClient(host, headers)
      return authenticatedClient.request(mutation, variables)
    }
    beforeEach(() => {
      userParams = {
        email: 'normalUser@example.org',
        password: '1234'
      }
    })

    describe('given invalid email', () => {
      beforeEach(() => {
        variables = { email: '@example.org' }
      })

      it('throws `Invalid email`', async () => {
        await expect(action()).rejects.toThrow('Invalid email')
      })
    })

    describe('given valid email', () => {
      beforeEach(() => {
        variables = { email: 'someUser@example.org' }
      })

      it('resolves', async () => {
        await expect(action()).resolves.toEqual({invite: true})
      })

      it('creates a user account with a `createdAt` attribute', async () => {
        await action()
        const userQuery = `{ User { createdAt } }`
        const { User: [user] } = await client.request(userQuery)
        expect(user.createdAt).toBeTruthy()
        expect(user.createdAt).toBe(expect.any(String))
      })

      describe('who has invited a lot of users already', () => {
        beforeEach(async () => {
          const emails  = ['u1@example.org','u2@example.org','u3@example.org']
          await Promise.all(emails.map(email => factory.create('User', { email })))
          const asUser = await Factory().authenticateAs(userParams)
          await Promise.all(emails.map(email => asUser.invite(email)))
        })

        describe('as ordinary `user`', () => {
          beforeEach(() => {
            userParams.role = 'user'
          })

          it('throws `Maximum number of invitations reached`', async () => {
            await expect(action()).rejects.toThrow('Maximum number of invitations reached')
          })

          it('creates no additional user accounts', async () => {
            await expect(action()).rejects
            const userQuery = `{ User { createdAt } }`
            const { User: users } = await client.request(userQuery)
            expect(users).toHaveLength(3)
          })
        })

        describe('as `admin`', () => {
          beforeEach(() => {
            userParams.role = 'admin'
          })

          it('can invite other users unlimited', async () => {
            await action()
            const userQuery = `{ User { createdAt } }`
            const { User: users } = await client.request(userQuery)
            expect(users).toHaveLength(4)
          })
        })
      })
    })
  })
})
