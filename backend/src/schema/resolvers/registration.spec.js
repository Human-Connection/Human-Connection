import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { getDriver, neode as getNeode } from '../../bootstrap/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

const factory = Factory()
const neode = getNeode()

let mutate
let authenticatedUser
let user
let variables
const driver = getDriver()

beforeEach(async () => {
  variables = {}
})

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      return {
        driver,
        neode,
        user: authenticatedUser,
      }
    },
  })
  mutate = createTestClient(server).mutate
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('CreateInvitationCode', () => {
  const mutation = gql`
    mutation {
      CreateInvitationCode {
        token
      }
    }
  `

  describe('unauthenticated', () => {
    beforeEach(() => {
      authenticatedUser = null
    })

    it('throws Authorization error', async () => {
      await expect(mutate({ mutation })).resolves.toMatchObject({
        errors: [{ message: 'Not Authorised!' }],
      })
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      user = await factory.create('User', {
        id: 'i123',
        name: 'Inviter',
        email: 'inviter@example.org',
        password: '1234',
        termsAndConditionsAgreedVersion: '0.0.1',
      })
      authenticatedUser = await user.toJson()
    })

    it('resolves', async () => {
      await expect(mutate({ mutation })).resolves.toMatchObject({
        data: { CreateInvitationCode: { token: expect.any(String) } },
      })
    })

    it('creates an InvitationCode with a `createdAt` attribute', async () => {
      await mutate({ mutation })
      const codes = await neode.all('InvitationCode')
      const invitation = await codes.first().toJson()
      expect(invitation.createdAt).toBeTruthy()
      expect(Date.parse(invitation.createdAt)).toEqual(expect.any(Number))
    })

    it('relates inviting User to InvitationCode', async () => {
      await mutate({ mutation })
      const result = await neode.cypher(
        'MATCH(code:InvitationCode)<-[:GENERATED]-(user:User) RETURN user',
      )
      const inviter = neode.hydrateFirst(result, 'user', neode.model('User'))
      await expect(inviter.toJson()).resolves.toEqual(expect.objectContaining({ name: 'Inviter' }))
    })

    describe('who has invited a lot of users already', () => {
      beforeEach(async () => {
        await Promise.all([mutate({ mutation }), mutate({ mutation }), mutate({ mutation })])
      })

      describe('as ordinary `user`', () => {
        it('throws `Not Authorised` because of maximum number of invitations', async () => {
          await expect(mutate({ mutation })).resolves.toMatchObject({
            errors: [{ message: 'Not Authorised!' }],
          })
        })

        it('creates no additional invitation codes', async () => {
          await mutate({ mutation })
          const invitationCodes = await neode.all('InvitationCode')
          await expect(invitationCodes.toJson()).resolves.toHaveLength(3)
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
  const mutation = gql`
    mutation($email: String!, $token: String!) {
      SignupByInvitation(email: $email, token: $token) {
        email
      }
    }
  `

  describe('with valid email but invalid InvitationCode', () => {
    beforeEach(() => {
      variables = {
        ...variables,
        email: 'any-email@example.org',
        token: 'wut?',
      }
    })

    it('throws UserInputError', async () => {
      await expect(mutate({ mutation, variables })).resolves.toMatchObject({
        errors: [{ message: 'UserInputError: Invitation code already used or does not exist.' }],
      })
    })

    describe('with valid InvitationCode', () => {
      beforeEach(async () => {
        const inviter = await factory.create('User', {
          name: 'Inviter',
          email: 'inviter@example.org',
          password: '1234',
        })
        authenticatedUser = await inviter.toJson()
        const invitationMutation = gql`
          mutation {
            CreateInvitationCode {
              token
            }
          }
        `
        const {
          data: {
            CreateInvitationCode: { token },
          },
        } = await mutate({ mutation: invitationMutation })
        authenticatedUser = null
        variables = {
          ...variables,
          token,
        }
      })

      describe('given an invalid email', () => {
        beforeEach(() => {
          variables = { ...variables, email: 'someuser' }
        })

        it('throws `email is not a valid email`', async () => {
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            errors: [{ message: expect.stringContaining('"email" must be a valid email') }],
          })
        })

        it('creates no additional EmailAddress node', async () => {
          let emailAddresses = await neode.all('EmailAddress')
          emailAddresses = await emailAddresses.toJson()
          expect(emailAddresses).toHaveLength(1)
          await mutate({ mutation, variables })
          emailAddresses = await neode.all('EmailAddress')
          emailAddresses = await emailAddresses.toJson()
          expect(emailAddresses).toHaveLength(1)
        })
      })

      describe('given a valid email', () => {
        beforeEach(() => {
          variables = { ...variables, email: 'someUser@example.org' }
        })

        it('resolves', async () => {
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: { SignupByInvitation: { email: 'someuser@example.org' } },
          })
        })

        describe('creates a EmailAddress node', () => {
          it('with a `createdAt` attribute', async () => {
            await mutate({ mutation, variables })
            let emailAddress = await neode.first('EmailAddress', { email: 'someuser@example.org' })
            emailAddress = await emailAddress.toJson()
            expect(emailAddress.createdAt).toBeTruthy()
            expect(Date.parse(emailAddress.createdAt)).toEqual(expect.any(Number))
          })

          it('with a cryptographic `nonce`', async () => {
            await mutate({ mutation, variables })
            let emailAddress = await neode.first('EmailAddress', { email: 'someuser@example.org' })
            emailAddress = await emailAddress.toJson()
            expect(emailAddress.nonce).toEqual(expect.any(String))
          })

          it('connects inviter through invitation code', async () => {
            await mutate({ mutation, variables })
            const result = await neode.cypher(
              'MATCH(inviter:User)-[:GENERATED]->(:InvitationCode)-[:ACTIVATED]->(email:EmailAddress {email: {email}}) RETURN inviter',
              { email: 'someuser@example.org' },
            )
            const inviter = neode.hydrateFirst(result, 'inviter', neode.model('User'))
            await expect(inviter.toJson()).resolves.toEqual(
              expect.objectContaining({ name: 'Inviter' }),
            )
          })

          describe('using the same InvitationCode twice', () => {
            it('rejects because codes can be used only once', async () => {
              await mutate({ mutation, variables })
              variables = { ...variables, email: 'yetanotheremail@example.org' }
              await expect(mutate({ mutation, variables })).resolves.toMatchObject({
                errors: [
                  { message: 'UserInputError: Invitation code already used or does not exist.' },
                ],
              })
            })
          })

          describe('if a user account with the given email already exists', () => {
            beforeEach(async () => {
              await factory.create('User', { email: 'someuser@example.org' })
            })

            it('throws unique violation error', async () => {
              await expect(mutate({ mutation, variables })).resolves.toMatchObject({
                errors: [{ message: 'User account with this email already exists.' }],
              })
            })
          })

          describe('if the EmailAddress already exists but without user account', () => {
            it.todo('shall we re-send the registration email?')
          })
        })
      })
    })
  })
})

describe('Signup', () => {
  const mutation = gql`
    mutation($email: String!) {
      Signup(email: $email) {
        email
      }
    }
  `
  beforeEach(() => {
    variables = { ...variables, email: 'someuser@example.org' }
  })

  describe('unauthenticated', () => {
    beforeEach(() => {
      authenticatedUser = null
    })

    it('throws AuthorizationError', async () => {
      await expect(mutate({ mutation, variables })).resolves.toMatchObject({
        errors: [{ message: 'Not Authorised!' }],
      })
    })

    describe('as admin', () => {
      beforeEach(async () => {
        const admin = await factory.create('User', {
          role: 'admin',
          email: 'admin@example.org',
          password: '1234',
        })
        authenticatedUser = await admin.toJson()
      })

      it('is allowed to signup users by email', async () => {
        await expect(mutate({ mutation, variables })).resolves.toMatchObject({
          data: { Signup: { email: 'someuser@example.org' } },
        })
      })

      it('creates a Signup with a cryptographic `nonce`', async () => {
        await mutate({ mutation, variables })
        let emailAddress = await neode.first('EmailAddress', { email: 'someuser@example.org' })
        emailAddress = await emailAddress.toJson()
        expect(emailAddress.nonce).toEqual(expect.any(String))
      })
    })
  })
})

describe('SignupVerification', () => {
  const mutation = gql`
    mutation(
      $name: String!
      $password: String!
      $email: String!
      $nonce: String!
      $termsAndConditionsAgreedVersion: String!
    ) {
      SignupVerification(
        name: $name
        password: $password
        email: $email
        nonce: $nonce
        termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
      ) {
        id
        termsAndConditionsAgreedVersion
        termsAndConditionsAgreedAt
      }
    }
  `
  describe('given valid password and email', () => {
    beforeEach(async () => {
      variables = {
        ...variables,
        nonce: '123456',
        name: 'John Doe',
        password: '123',
        email: 'john@example.org',
        termsAndConditionsAgreedVersion: '0.0.1',
        termsAndConditionsAgreedAt: null,
      }
    })

    describe('unauthenticated', () => {
      beforeEach(async () => {
        authenticatedUser = null
      })

      describe('EmailAddress exists, but is already related to a user account', () => {
        beforeEach(async () => {
          const { email, nonce } = variables
          const [emailAddress, user] = await Promise.all([
            neode.model('EmailAddress').create({ email, nonce }),
            neode
              .model('User')
              .create({ name: 'Somebody', password: '1234', email: 'john@example.org' }),
          ])
          await emailAddress.relateTo(user, 'belongsTo')
        })

        describe('sending a valid nonce', () => {
          beforeEach(() => {
            variables = { ...variables, nonce: '123456' }
          })

          it('rejects', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              errors: [{ message: 'Invalid email or nonce' }],
            })
          })
        })
      })

      describe('disconnected EmailAddress exists', () => {
        beforeEach(async () => {
          const args = {
            email: 'john@example.org',
            nonce: '123456',
          }
          await neode.model('EmailAddress').create(args)
        })

        describe('sending a valid nonce', () => {
          it('creates a user account', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: {
                SignupVerification: expect.objectContaining({
                  id: expect.any(String),
                }),
              },
            })
          })

          it('sets `verifiedAt` attribute of EmailAddress', async () => {
            await mutate({ mutation, variables })
            const email = await neode.first('EmailAddress', { email: 'john@example.org' })
            await expect(email.toJson()).resolves.toEqual(
              expect.objectContaining({
                verifiedAt: expect.any(String),
              }),
            )
          })

          it('connects User with EmailAddress', async () => {
            const cypher = `
                MATCH(email:EmailAddress)-[:BELONGS_TO]->(u:User {name: {name}})
                RETURN email
              `
            await mutate({ mutation, variables })
            const { records: emails } = await neode.cypher(cypher, { name: 'John Doe' })
            expect(emails).toHaveLength(1)
          })

          it('marks the EmailAddress as primary', async () => {
            const cypher = `
                MATCH(email:EmailAddress)<-[:PRIMARY_EMAIL]-(u:User {name: {name}})
                RETURN email
              `
            await mutate({ mutation, variables })
            const { records: emails } = await neode.cypher(cypher, { name: 'John Doe' })
            expect(emails).toHaveLength(1)
          })

          it('is version of terms and conditions saved correctly', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: {
                SignupVerification: expect.objectContaining({
                  termsAndConditionsAgreedVersion: '0.0.1',
                }),
              },
            })
          })

          it('if a current date of the General Terms and Conditions is available', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: {
                SignupVerification: expect.objectContaining({
                  termsAndConditionsAgreedAt: expect.any(String),
                }),
              },
            })
          })

          it('rejects if version of terms and conditions has wrong format', async () => {
            variables = { ...variables, termsAndConditionsAgreedVersion: 'invalid version format' }
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              errors: [{ message: 'Invalid version format!' }],
            })
          })
        })

        describe('sending invalid nonce', () => {
          beforeEach(() => {
            variables = { ...variables, nonce: 'wut2' }
          })

          it('rejects', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              errors: [{ message: 'Invalid email or nonce' }],
            })
          })
        })
      })
    })
  })
})
