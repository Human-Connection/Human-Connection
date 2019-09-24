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
        MATCH(u:User)-[:PRIMARY_EMAIL]->(p:EmailAddress {email: "user@example.org"})
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
      it.todo('returns this `EmailAddress` node')
    })

    describe('but if another user owns an `EmailAddress` already with that email', () => {
      it.todo('throws UserInputError because of unique constraints')
    })
  })
})

describe('VerifyEmailAddress', () => {
  const mutation = gql`
    mutation($email: String!, $nonce: String!) {
      VerifyEmailAddress(email: $email, nonce: $nonce) {
        email
        createdAt
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
    describe('if no unverified `EmailAddress` node exists', () => {
      it.todo('throws UserInputError')
    })

    describe('given invalid nonce', () => {
      it.todo('throws UserInputError')
    })

    describe('given valid nonce for unverified `EmailAddress` node', () => {
      describe('but the address does not belong to the authenticated user', () => {
        it.todo('throws UserInputError')
      })

      describe('and the `EmailAddress` belongs to the authenticated user', () => {
        it.todo('adds `verifiedAt`')
        it.todo('connects the new `EmailAddress` as PRIMARY')
        it.todo('removes previous PRIMARY relationship')
      })
    })
  })
})
