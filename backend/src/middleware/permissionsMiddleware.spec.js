import { createTestClient } from 'apollo-server-testing'
import createServer from '../server'
import Factory from '../seed/factories'
import { gql } from '../jest/helpers'
import { getDriver, neode as getNeode } from '../bootstrap/neo4j'

const factory = Factory()
const instance = getNeode()
const driver = getDriver()

let query, authenticatedUser, owner, someoneElse, adminExtraordinaire, variables

const userQuery = gql`
  query($name: String) {
    User(name: $name) {
      email
    }
  }
`

describe('authorization', () => {
  beforeAll(async()=>{
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
      [owner, someoneElse, adminExtraordinaire] = await Promise.all([
        factory.create('User', {
          email: 'owner@example.org',
          name: 'Owner',
          password: 'iamtheowner',
        }),
      factory.create('User', {
          email: 'someone@example.org',
          name: 'Someone else',
          password: 'else',
        }),
        factory.create('User', {
          email: 'admin@example.org',
          name: 'Admin extraordinaire',
          password: 'admin',
        }),
      ])
      variables = {}
    })

    afterEach(async () => {
      await factory.cleanDatabase()
    })

    describe('access email address', () => {
      describe('not logged in', () => {
        beforeEach(()=>{
          authenticatedUser = null
        })
        it("throws an error and does not expose the owner's email address", async () => {
          const expected = await query({ query: userQuery, variables: { name: 'Owner' } })
          await expect(query({ query: userQuery, variables: { name: 'Owner' } })).resolves.toMatchObject({ 
            errors: [{ message: 'Not Authorised!'}],
            data: { User: [null]}
          })
        })
      })

      describe('as owner', () => {
        beforeEach(() => {
          loginCredentials = {
            email: 'owner@example.org',
            password: 'iamtheowner',
          }
        })

        it("exposes the owner's email address", async () => {
          await expect(action()).resolves.toEqual({ User: [{ email: 'owner@example.org' }] })
        })
      })

      describe('authenticated as another user', () => {
        beforeEach(async () => {
          loginCredentials = {
            email: 'someone@example.org',
            password: 'else',
          }
        })

        it('rejects', async () => {
          await expect(action()).rejects.toThrow('Not Authorised!')
        })

        it("does not expose the owner's email address", async () => {
          let response
          try {
            await action()
          } catch (error) {
            response = error.response.data
          }
          expect(response).toEqual({ User: [null] })
        })
      })
    })
  })
})
