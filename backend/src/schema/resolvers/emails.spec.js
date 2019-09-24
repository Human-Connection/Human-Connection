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

describe('AddEmailAddress', () => {
  const mutation = gql`
    mutation($email: String!) {
      AddEmailAddress(email: $email) {
        email
        verifiedAt
        createdAt
      }
    }
  `
  beforeEach(() => {
    variables = { ...variables, email: 'new-email@example.org' }
  })

  describe('unauthenticated', () => {
    beforeEach(() => {
      authenticatedUser = null
    })

    it('throws AuthorizationError', async () => {
      await expect(mutate({ mutation, variables })).resolves.toMatchObject({
        data: { AddEmailAddress: null },
        errors: [{ message: 'Not Authorised!' }],
      })
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      user = await factory.create('User', { email: 'user@example.org' })
      authenticatedUser = await user.toJson()
    })

    describe('email attribute is not a valid email', () => {
      it.todo('throws UserInputError')
    })

    describe('email attribute is a valid email', () => {
      it('creates a new unverified `EmailAddress` node', async () => {
        await expect(mutate({ mutation, variables })).resolves.toMatchObject({
          data: {
            AddEmailAddress: {
              email: 'new-email@example.org',
              verifiedAt: null,
              createdAt: expect.any(String),
            },
          },
          errors: undefined,
        })
      })

      it('connects `EmailAddress` to the authenticated user', async () => {
        await mutate({ mutation, variables })
        const result = await neode.cypher(`
        MATCH(u:User)-[:PRIMARY_EMAIL]->(:EmailAddress {email: "user@example.org"})
        MATCH(u:User)<-[:BELONGS_TO]-(e:EmailAddress {email: "new-email@example.org"})
        RETURN e
      `)
        const email = neode.hydrateFirst(result, 'e', neode.model('EmailAddress'))
        await expect(email.toJson()).resolves.toMatchObject({
          email: 'new-email@example.org',
          nonce: expect.any(String),
        })
      })

      describe('if a lone `EmailAddress` node already exists with that email', () => {
        it('returns this `EmailAddress` node', async () => {
          await factory.create('EmailAddress', {
            verifiedAt: null,
            createdAt: '2019-09-24T14:00:01.565Z',
            email: 'new-email@example.org',
          })
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: {
              AddEmailAddress: {
                email: 'new-email@example.org',
                verifiedAt: null,
                createdAt: '2019-09-24T14:00:01.565Z', // this is to make sure it's the one above
              },
            },
            errors: undefined,
          })
        })
      })

      describe('but if another user owns an `EmailAddress` already with that email', () => {
        it('throws UserInputError because of unique constraints', async () => {
          await factory.create('User', { email: 'new-email@example.org' })
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: { AddEmailAddress: null },
            errors: [{ message: 'A user account with this email already exists.' }],
          })
        })
      })
    })
  })
})

describe('VerifyEmailAddress', () => {
  const mutation = gql`
    mutation($email: String!, $nonce: String!) {
      VerifyEmailAddress(email: $email, nonce: $nonce) {
        email
        createdAt
        verifiedAt
      }
    }
  `

  beforeEach(() => {
    variables = { ...variables, email: 'to-be-verified@example.org', nonce: '123456' }
  })

  describe('unauthenticated', () => {
    beforeEach(() => {
      authenticatedUser = null
    })

    it('throws AuthorizationError', async () => {
      await expect(mutate({ mutation, variables })).resolves.toMatchObject({
        data: { VerifyEmailAddress: null },
        errors: [{ message: 'Not Authorised!' }],
      })
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      user = await factory.create('User', { email: 'user@example.org' })
      authenticatedUser = await user.toJson()
    })

    describe('if no unverified `EmailAddress` node exists', () => {
      it('throws UserInputError', async () => {
        await expect(mutate({ mutation, variables })).resolves.toMatchObject({
          data: { VerifyEmailAddress: null },
          errors: [{ message: 'Invalid nonce or no email address found.' }],
        })
      })
    })

    describe('given an unverified `EmailAddress`', () => {
      let emailAddress
      beforeEach(async () => {
        emailAddress = await factory.create('EmailAddress', {
          nonce: 'abcdef',
          verifiedAt: null,
          createdAt: new Date().toISOString(),
          email: 'to-be-verified@example.org',
        })
      })

      describe('given invalid nonce', () => {
        it('throws UserInputError', async () => {
          variables.nonce = 'asdfgh'
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: { VerifyEmailAddress: null },
            errors: [{ message: 'Invalid nonce or no email address found.' }],
          })
        })
      })

      describe('given valid nonce for unverified `EmailAddress` node', () => {
        beforeEach(() => {
          variables = { ...variables, nonce: 'abcdef' }
        })

        describe('but the address does not belong to the authenticated user', () => {
          it('throws UserInputError', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: { VerifyEmailAddress: null },
              errors: [{ message: 'Invalid nonce or no email address found.' }],
            })
          })
        })

        describe('and the `EmailAddress` belongs to the authenticated user', () => {
          beforeEach(async () => {
            await emailAddress.relateTo(user, 'belongsTo')
          })

          it('adds `verifiedAt`', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: {
                VerifyEmailAddress: {
                  email: 'to-be-verified@example.org',
                  verifiedAt: expect.any(String),
                  createdAt: expect.any(String),
                },
              },
              errors: undefined,
            })
          })

          it('connects the new `EmailAddress` as PRIMARY', async () => {
            await mutate({ mutation, variables })
            const result = await neode.cypher(`
            MATCH(u:User)-[:PRIMARY_EMAIL]->(e:EmailAddress {email: "to-be-verified@example.org"})
            MATCH(u:User)<-[:BELONGS_TO]-(:EmailAddress {email: "user@example.org"})
            RETURN e
          `)
            const email = neode.hydrateFirst(result, 'e', neode.model('EmailAddress'))
            await expect(email.toJson()).resolves.toMatchObject({
              email: 'to-be-verified@example.org',
            })
          })

          it('removes previous PRIMARY relationship', async () => {
            const cypherStatement = `
            MATCH(u:User)-[:PRIMARY_EMAIL]->(e:EmailAddress {email: "user@example.org"})
            RETURN e
          `
            let result = await neode.cypher(cypherStatement)
            let email = neode.hydrateFirst(result, 'e', neode.model('EmailAddress'))
            await expect(email.toJson()).resolves.toMatchObject({
              email: 'user@example.org',
            })
            await mutate({ mutation, variables })
            result = await neode.cypher(cypherStatement)
            email = neode.hydrateFirst(result, 'e', neode.model('EmailAddress'))
            await expect(email).toBe(false)
          })
        })
      })
    })
  })
})
