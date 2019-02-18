import { create, cleanDatabase } from '../seed/factories'
import { testServerHost as host, authenticatedHeaders } from '../jest/helpers'
import { GraphQLClient } from 'graphql-request'

describe('authorization', () => {
  describe('given two existing users', () => {
    beforeEach(async () => {
      await create('user', {
        email: 'owner@example.org',
        name: 'Owner',
        password: 'iamtheowner'
      })
      await create('user', {
        email: 'someone@example.org',
        name: 'Someone else',
        password: 'else'
      })
    })

    afterEach(async () => {
      await cleanDatabase()
    })

    describe('access email address', () => {
      let headers = {}
      const action = async (headers) => {
        const graphQLClient = new GraphQLClient(host, { headers })
        return graphQLClient.request(`{
          User(name: "Owner") {
            email
          }
        }`)
      }

      describe('not logged in', async () => {
        it('does not expose the owner\'s email address', async () => {
          try {
            await action(headers)
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Not Authorised!')
            expect(error.response.data).toEqual({ User: [ { email: null } ] })
          }
        })
      })

      describe('as owner', () => {
        it('exposes the owner\'s email address', async () => {
          headers = await authenticatedHeaders({
            email: 'owner@example.org',
            password: 'iamtheowner'
          })
          expect(await action(headers)).toEqual({ User: [ { email: 'owner@example.org' } ] })
        })
      })

      describe('as someone else', () => {
        it('does not expose the owner\'s email address', async () => {
          headers = await authenticatedHeaders({
            email: 'someone@example.org',
            password: 'else'
          })
          try {
            await action(headers)
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Not Authorised!')
            expect(error.response.data).toEqual({ User: [ { email: null } ] })
          }
        })
      })
    })
  })
})
