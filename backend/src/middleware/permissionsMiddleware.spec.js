import { createTestClient } from 'apollo-server-testing'
import createServer from '../server'
import Factory from '../seed/factories'
import { gql } from '../helpers/jest'
import { getDriver, getNeode } from '../bootstrap/neo4j'

const factory = Factory()
const instance = getNeode()
const driver = getDriver()

let query, authenticatedUser, owner, anotherRegularUser, administrator, variables, moderator

const userQuery = gql`
  query($name: String) {
    User(name: $name) {
      email
    }
  }
`

describe('authorization', () => {
  beforeAll(async () => {
    await factory.cleanDatabase()
    const { server } = createServer({
      context: () => ({
        driver,
        instance,
        user: authenticatedUser,
      }),
    })
    query = createTestClient(server).query
  })

  describe('given two existing users', () => {
    beforeEach(async () => {
      ;[owner, anotherRegularUser, administrator, moderator] = await Promise.all([
        factory.create('User', {
          email: 'owner@example.org',
          name: 'Owner',
          password: 'iamtheowner',
        }),
        factory.create('User', {
          email: 'another.regular.user@example.org',
          name: 'Another Regular User',
          password: 'else',
        }),
        factory.create('User', {
          email: 'admin@example.org',
          name: 'Admin',
          password: 'admin',
          role: 'admin',
        }),
        factory.create('User', {
          email: 'moderator@example.org',
          name: 'Moderator',
          password: 'moderator',
          role: 'moderator',
        }),
      ])
      variables = {}
    })

    afterEach(async () => {
      await factory.cleanDatabase()
    })

    describe('access email address', () => {
      describe('unauthenticated', () => {
        beforeEach(() => {
          authenticatedUser = null
        })
        it("throws an error and does not expose the owner's email address", async () => {
          await expect(
            query({ query: userQuery, variables: { name: 'Owner' } }),
          ).resolves.toMatchObject({
            errors: [{ message: 'Not Authorised!' }],
            data: { User: [null] },
          })
        })
      })

      describe('authenticated', () => {
        describe('as the owner', () => {
          beforeEach(async () => {
            authenticatedUser = await owner.toJson()
          })

          it("exposes the owner's email address", async () => {
            variables = { name: 'Owner' }
            await expect(query({ query: userQuery, variables })).resolves.toMatchObject({
              data: { User: [{ email: 'owner@example.org' }] },
              errors: undefined,
            })
          })
        })

        describe('as another regular user', () => {
          beforeEach(async () => {
            authenticatedUser = await anotherRegularUser.toJson()
          })

          it("throws an error and does not expose the owner's email address", async () => {
            await expect(
              query({ query: userQuery, variables: { name: 'Owner' } }),
            ).resolves.toMatchObject({
              errors: [{ message: 'Not Authorised!' }],
              data: { User: [null] },
            })
          })
        })

        describe('as a moderator', () => {
          beforeEach(async () => {
            authenticatedUser = await moderator.toJson()
          })

          it("throws an error and does not expose the owner's email address", async () => {
            await expect(
              query({ query: userQuery, variables: { name: 'Owner' } }),
            ).resolves.toMatchObject({
              errors: [{ message: 'Not Authorised!' }],
              data: { User: [null] },
            })
          })
        })

        describe('administrator', () => {
          beforeEach(async () => {
            authenticatedUser = await administrator.toJson()
          })

          it("exposes the owner's email address", async () => {
            variables = { name: 'Owner' }
            await expect(query({ query: userQuery, variables })).resolves.toMatchObject({
              data: { User: [{ email: 'owner@example.org' }] },
              errors: undefined,
            })
          })
        })
      })
    })
  })
})
