import { createTestClient } from 'apollo-server-testing'
import createServer from '../server'
import Factory, { cleanDatabase } from '../db/factories'
import { gql } from '../helpers/jest'
import { getDriver, getNeode } from '../db/neo4j'

const instance = getNeode()
const driver = getDriver()

let query, authenticatedUser, owner, anotherRegularUser, administrator, variables, moderator

describe('authorization', () => {
  beforeAll(async () => {
    await cleanDatabase()
    const { server } = createServer({
      context: () => ({
        driver,
        instance,
        user: authenticatedUser,
      }),
    })
    query = createTestClient(server).query
  })

  afterEach(async () => {
    await cleanDatabase()
  })

  describe('given an owner, an other user, an admin, a moderator', () => {
    beforeEach(async () => {
      ;[owner, anotherRegularUser, administrator, moderator] = await Promise.all([
        Factory.build(
          'user',
          {
            name: 'Owner',
          },
          {
            email: 'owner@example.org',
            password: 'iamtheowner',
          },
        ),
        Factory.build(
          'user',
          {
            name: 'Another Regular User',
          },
          {
            email: 'another.regular.user@example.org',
            password: 'else',
          },
        ),
        Factory.build(
          'user',
          {
            name: 'Admin',
            role: 'admin',
          },
          {
            email: 'admin@example.org',
            password: 'admin',
          },
        ),
        Factory.build(
          'user',
          {
            name: 'Moderator',
            role: 'moderator',
          },
          {
            email: 'moderator@example.org',
            password: 'moderator',
          },
        ),
      ])
      variables = {}
    })

    describe('access email address', () => {
      const userQuery = gql`
        query($name: String) {
          User(name: $name) {
            email
          }
        }
      `

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

        describe('as an administrator', () => {
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
