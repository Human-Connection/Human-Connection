import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'
import { getDriver } from '../../bootstrap/neo4j'

let factory
let client
let variables
let action
let userParams
const driver = getDriver()

beforeEach(async () => {
  variables = {}
  factory = Factory()
})

afterEach(async () => {
  await factory.cleanDatabase()
})

const getAllSignups = async () => {
  const session = driver.session()
  let transactionRes = await session.run('MATCH (s:SignUp) RETURN s')
  const signups = transactionRes.records.map(record => record.get('s'))
  session.close()
  return signups
}

describe('CreateInvitationCode', () => {
  const mutation = `mutation { CreateInvitationCode { token } }`

  it('throws Authorization error', async () => {
    const client = new GraphQLClient(host)
    await expect(client.request(mutation)).rejects.toThrow('Not Authorised!')
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
        return client.request(mutation)
      }
    })

    it('resolves', async () => {
      await expect(action()).resolves.toEqual({
        CreateInvitationCode: { token: expect.any(String) },
      })
    })

    it('creates an InvitationCode with a `createdAt` attribute', async () => {
      await action()
      const invitationQuery = `{ InvitationCode { createdAt } }`
      const {
        InvitationCode: [invitation],
      } = await factory.request(invitationQuery)
      expect(invitation.createdAt).toBeTruthy()
      expect(Date.parse(invitation.createdAt)).toEqual(expect.any(Number))
    })

    it('relates inviting User to InvitationCode', async () => {
      await action()
      const invitationQuery = `{ InvitationCode { generatedBy { name } } }`
      const {
        InvitationCode: [user],
      } = await factory.request(invitationQuery)
      const expected = { generatedBy: { name: 'Inviter' } }
      expect(user).toEqual(expected)
    })

    describe('who has invited a lot of users already', () => {
      beforeEach(() => {
        action = async () => {
          const factory = Factory()
          await factory.create('User', userParams)
          const times = [1, 2, 3]
          let asUser = Factory()
          asUser = await asUser.authenticateAs(userParams)
          await Promise.all(
            times.map(() => {
              return asUser.request(mutation)
            }),
          )
          const headers = await login(userParams)
          client = new GraphQLClient(host, { headers })
          return client.request(mutation, variables)
        }
      })

      describe('as ordinary `user`', () => {
        it('throws `Not Authorised` because of maximum number of invitations', async () => {
          await expect(action()).rejects.toThrow('Not Authorised')
        })

        it('creates no additional user accounts', async done => {
          try {
            await action()
          } catch (e) {
            const invitationQuery = `{ InvitationCode { createdAt } }`
            const { InvitationCode: codes } = await factory.request(invitationQuery)
            expect(codes).toHaveLength(3)
            done()
          }
        })
      })

      describe('as a strong donator', () => {
        beforeEach(() => {
          // What is the setup?
        })

        it.todo('can invite more people')
        // it('can invite more people', async () => {
        // await action()
        // const invitationQuery = `{ User { createdAt } }`
        // const { User: users } = await client.request(invitationQuery )
        // expect(users).toHaveLength(3 + 1 + 1)
        // })
      })
    })
  })
})

describe('CreateSignUpByInvitationCode', () => {
  const mutation = `mutation($email: String!, $token: String!) {
    CreateSignUpByInvitationCode(email: $email, token: $token) { email }
  }`

  beforeEach(() => {
    client = new GraphQLClient(host)
    action = async () => {
      return client.request(mutation, variables)
    }
  })

  it.todo('throws Authorization error')

  describe('with invalid InvitationCode', () => {
    beforeEach(() => {
      variables.token = 'wut?'
    })

    it.todo('throws UserInputError')
  })

  describe('with valid InvitationCode', () => {
    beforeEach(async () => {
      const inviterParams = {
        name: 'Inviter',
        email: 'inviter@example.org',
        password: '1234',
      }
      const factory = Factory()
      await factory.create('User', inviterParams)
      let asUser = Factory()
      asUser = await asUser.authenticateAs(inviterParams)
      const invitationMutation = `mutation { CreateInvitationCode { token } }`
      const {
        CreateInvitationCode: { token },
      } = await asUser.request(invitationMutation)
      variables.token = token
    })

    describe('given an invalid email', () => {
      beforeEach(() => {
        variables.email = 'someuser'
      })

      it('throws `email is not a valid email`', async () => {
        await expect(action()).rejects.toThrow('email is not a valid email')
      })

      it('creates no SignUp node', async done => {
        try {
          await action()
        } catch (e) {
          const signUpQuery = `{ SignUp { email } }`
          await expect(factory.request(signUpQuery)).resolves.toEqual({ SignUp: [] })
          done()
        }
      })
    })

    describe('given a valid email', () => {
      beforeEach(() => {
        variables.email = 'someuser@example.org'
      })

      it('resolves', async () => {
        await expect(action()).resolves.toEqual({
          CreateSignUpByInvitationCode: { email: 'someuser@example.org' },
        })
      })

      describe('creates a SignUp node', () => {
        it('with a `createdAt` attribute', async () => {
          await action()
          const signUpQuery = `{ SignUp { createdAt } }`
          const {
            SignUp: [signup],
          } = await factory.request(signUpQuery)
          expect(signup.createdAt).toBeTruthy()
          expect(Date.parse(signup.createdAt)).toEqual(expect.any(Number))
        })

        it('with a cryptographic `nonce`', async () => {
          await action()
          const [signup] = await getAllSignups()
          expect(signup.properties.nonce).toEqual(expect.any(String))
        })

        it('connects inviting user', async () => {
          await action()
          const userQuery = `{ SignUp { invitedBy { name } } }`
          const {
            SignUp: [signup],
          } = await factory.request(userQuery)
          expect(signup).toEqual({ invitedBy: { name: 'Inviter' } })
        })

        describe('using the same InvitationCode twice', () => {
          it('rejects because codes can be used only once', async done => {
            await action()
            try {
              await action()
            } catch (e) {
              expect(e.message).toMatch(/Invitation code already used/)
              done()
            }
          })
        })

        describe('if a user account with the given email already exists', () => {
          beforeEach(async () => {
            await factory.create('User', { email: 'someUser@example.org' })
          })

          it('throws unique violation error', async () => {
            await expect(action()).rejects.toThrow('User account with this email already exists.')
          })
        })

        describe('if a Signup with the given email already exists', () => {
          it.todo('decide what to do')
        })
      })
    })
  })
})

describe('CreateSignUp', () => {
  const mutation = `mutation($email: String!) {
    CreateSignUp(email: $email) { email }
  }`

  it.todo('throws AuthorizationError')

  describe('as admin', () => {
    beforeEach(async () => {
      userParams = {
        role: 'admin',
        email: 'admin@example.org',
        password: '1234',
      }
      variables.email = 'someuser@example.org'
      const factory = Factory()
      await factory.create('User', userParams)
      const headers = await login(userParams)
      client = new GraphQLClient(host, { headers })
      action = async () => {
        return client.request(mutation, variables)
      }
    })

    it('is allowed so signup users by email', async () => {
      await expect(action()).resolves.toEqual({ CreateSignUp: { email: 'someuser@example.org' } })
    })

    it('creates a Signup with a cryptographic `nonce`', async () => {
      await action()
      const [signup] = await getAllSignups()
      expect(signup.properties.nonce).toEqual(expect.any(String))
    })
  })
})
