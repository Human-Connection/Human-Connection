import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'

let factory
let client
let variables
let action

beforeEach(async () => {
  factory = Factory()
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('signup', () => {
  const mutation = `mutation($email: String!) { signup(email: $email) }`

  beforeEach(() => {
    client = new GraphQLClient(host)
    action = async () => {
      return client.request(mutation, variables)
    }
  })

  describe('given an invalid email', () => {
    beforeEach(() => {
      variables = { email: 'someUser' }
    })

    it('throws `email is not a valid email`', async () => {
      await expect(action()).rejects.toThrow('email is not a valid email')
    })

    it('creates no user account', async done => {
      try {
        await action()
      } catch (e) {
        const userQuery = `{ User { createdAt } }`
        await expect(client.request(userQuery)).resolves.toEqual({ User: [] })
        done()
      }
    })
  })

  describe('given a valid email', () => {
    beforeEach(() => {
      variables = { email: 'someUser@example.org' }
    })

    it('resolves', async () => {
      await expect(action()).resolves.toEqual({ signup: true })
    })

    describe('creates a user account', () => {
      it('with a `createdAt` attribute', async () => {
        await action()
        const userQuery = `{ User { createdAt } }`
        const {
          User: [user],
        } = await client.request(userQuery)
        expect(user.createdAt).toBeTruthy()
        expect(Date.parse(user.createdAt)).toEqual(expect.any(Number))
      })

      it('which is not yet verified', async () => {
        await action()
        const userQuery = `{ User { isVerified } }`
        const {
          User: [user],
        } = await client.request(userQuery)
        expect(user.isVerified).toBe(false)
      })

      describe('if a user account with the given email already exists', () => {
        beforeEach(async () => {
          await factory.create('User', { email: 'someUser@example.org' })
        })

        it('throws unique violation error', async () => {
          await expect(action()).rejects.toThrow('User account with this email already exists.')
        })
      })
    })
  })
})

describe('invite', () => {
  const mutation = `mutation($email: String!) { invite(email: $email) }`
  let userParams

  it('throws Authorization error', async () => {
    const client = new GraphQLClient(host)
    await expect(client.request(mutation, { email: 'blah@example.org' })).rejects.toThrow(
      'Not Authorised!',
    )
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      userParams = {
        name: 'Inviter',
        email: 'inviter@example.org',
        password: '1234',
      }
      action = async () => {
        const factory = Factory()
        await factory.create('User', userParams)
        const headers = await login(userParams)
        client = new GraphQLClient(host, { headers })
        return client.request(mutation, variables)
      }
    })

    describe('given invalid email', () => {
      beforeEach(() => {
        variables = { email: '@example.org' }
      })

      it('throws `email is not a valid email`', async () => {
        await expect(action()).rejects.toThrow('email is not a valid email')
      })
    })

    describe('given valid email', () => {
      beforeEach(() => {
        variables = { email: 'someUser@example.org' }
      })

      it('resolves', async () => {
        await expect(action()).resolves.toEqual({ invite: true })
      })

      it('creates a user account with a `createdAt` attribute', async () => {
        await action()
        const userQuery = `{ User { createdAt } }`
        const {
          User: [ownUser, user],
        } = await client.request(userQuery)
        expect(ownUser.createdAt).toBeTruthy()
        expect(user.createdAt).toBeTruthy()
        expect(Date.parse(ownUser.createdAt)).toEqual(expect.any(Number))
        expect(Date.parse(user.createdAt)).toEqual(expect.any(Number))
      })

      it('connects the inviting user with the new account', async () => {
        await action()
        const userQuery = `{ User(isVerified: false) { invitedBy { name } } }`
        const {
          User: [user],
        } = await client.request(userQuery)
        const expected = { invitedBy: { name: 'Inviter' } }
        expect(user).toEqual(expected)
      })

      describe('who has invited a lot of users already', () => {
        beforeEach(() => {
          action = async () => {
            const factory = Factory()
            await factory.create('User', userParams)
            const emails = ['u1@example.org', 'u2@example.org', 'u3@example.org']
            let asUser = Factory()
            asUser = await asUser.authenticateAs(userParams)
            await Promise.all(
              emails.map(email => {
                return asUser.invite({ email })
              }),
            )
            const headers = await login(userParams)
            client = new GraphQLClient(host, { headers })
            return client.request(mutation, variables)
          }
        })

        describe('as ordinary `user`', () => {
          beforeEach(() => {
            userParams.role = 'user'
          })

          it('throws `Not Authorised` because of maximum number of invitations', async () => {
            await expect(action()).rejects.toThrow('Not Authorised')
          })

          it('creates no additional user accounts', async done => {
            try {
              await action()
            } catch (e) {
              const userQuery = `{ User { createdAt } }`
              const { User: users } = await client.request(userQuery)
              expect(users).toHaveLength(3 + 1)
              done()
            }
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
            expect(users).toHaveLength(3 + 1 + 1)
          })
        })
      })
    })
  })
})
