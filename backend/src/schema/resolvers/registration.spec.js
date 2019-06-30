import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'
import { neode } from '../../bootstrap/neo4j'

let factory
let client
let variables
let action
let userParams
const instance = neode()

beforeEach(async () => {
  variables = {}
  factory = Factory()
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('CreateInvitationCode', () => {
  const mutation = `mutation { CreateInvitationCode { token } }`

  it('throws Authorization error', async () => {
    const client = new GraphQLClient(host)
    await expect(client.request(mutation)).rejects.toThrow('Not Authorised!')
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      userParams = {
        id: 'i123',
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
      const codes = await instance.all('InvitationCode')
      const invitation = await codes.first().toJson()
      expect(invitation.createdAt).toBeTruthy()
      expect(Date.parse(invitation.createdAt)).toEqual(expect.any(Number))
    })

    it('relates inviting User to InvitationCode', async () => {
      await action()
      const result = await instance.cypher(
        'MATCH(code:InvitationCode)<-[:GENERATED]-(user:User) RETURN user',
      )
      const inviter = instance.hydrateFirst(result, 'user', instance.model('User'))
      await expect(inviter.toJson()).resolves.toEqual(expect.objectContaining({ name: 'Inviter' }))
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

        it('creates no additional invitation codes', async done => {
          try {
            await action()
          } catch (e) {
            const invitationCodes = await instance.all('InvitationCode')
            await expect(invitationCodes.toJson()).resolves.toHaveLength(3)
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

describe('SignupByInvitation', () => {
  const mutation = `mutation($email: String!, $token: String!) {
    SignupByInvitation(email: $email, token: $token) { email }
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
        await expect(action()).rejects.toThrow('"email" must be a valid email')
      })

      it('creates no EmailAddress node', async done => {
        try {
          await action()
        } catch (e) {
          const emailAddresses = await instance.all('EmailAddress')
          expect(emailAddresses).toHaveLength(0)
          done()
        }
      })
    })

    describe('given a valid email', () => {
      beforeEach(() => {
        variables.email = 'someUser@example.org'
      })

      it('resolves', async () => {
        await expect(action()).resolves.toEqual({
          SignupByInvitation: { email: 'someuser@example.org' },
        })
      })

      describe('creates a EmailAddress node', () => {
        it('with a `createdAt` attribute', async () => {
          await action()
          const emailAddresses = await instance.all('EmailAddress')
          const emailAddress = await emailAddresses.first().toJson()
          expect(emailAddress.createdAt).toBeTruthy()
          expect(Date.parse(emailAddress.createdAt)).toEqual(expect.any(Number))
        })

        it('with a cryptographic `nonce`', async () => {
          await action()
          const emailAddresses = await instance.all('EmailAddress')
          const emailAddress = await emailAddresses.first().toJson()
          expect(emailAddress.nonce).toEqual(expect.any(String))
        })

        it('connects inviter through invitation code', async () => {
          await action()
          const result = await instance.cypher(
            'MATCH(inviter:User)-[:GENERATED]->(:InvitationCode)-[:ACTIVATED]->(email:EmailAddress {email: {email}}) RETURN inviter',
            { email: 'someuser@example.org' },
          )
          const inviter = instance.hydrateFirst(result, 'inviter', instance.model('User'))
          await expect(inviter.toJson()).resolves.toEqual(
            expect.objectContaining({ name: 'Inviter' }),
          )
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
            await factory.create('User', { email: 'someuser@example.org' })
          })

          it('throws unique violation error', async () => {
            await expect(action()).rejects.toThrow('User account with this email already exists.')
          })
        })

        describe('if the EmailAddress already exists but without user account', () => {
          it.todo('decide what to do')
        })
      })
    })
  })
})

describe('signup', () => {
  const mutation = `mutation($email: String!) {
    Signup(email: $email) { email }
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
      await expect(action()).resolves.toEqual({ Signup: { email: 'someuser@example.org' } })
    })

    it('creates a Signup with a cryptographic `nonce`', async () => {
      await action()
      const emailAddresses = await instance.all('EmailAddress')
      const emailAddress = await emailAddresses.first().toJson()
      expect(emailAddress.nonce).toEqual(expect.any(String))
    })
  })
})
