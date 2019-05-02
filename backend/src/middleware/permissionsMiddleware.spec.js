import Factory from '../seed/factories'
import { host, login } from '../jest/helpers'
import { GraphQLClient } from 'graphql-request'

const factory = Factory()

describe('authorization', () => {
  describe('given two existing users', () => {
    beforeEach(async () => {
      await factory.create('User', {
        email: 'owner@example.org',
        name: 'Owner',
        password: 'iamtheowner'
      })
      await factory.create('User', {
        email: 'someone@example.org',
        name: 'Someone else',
        password: 'else'
      })
    })

    afterEach(async () => {
      await factory.cleanDatabase()
    })

    describe('access email address', () => {
      let headers = {}
      let loginCredentials = null
      const action = async () => {
        if (loginCredentials) {
          headers = await login(loginCredentials)
        }
        const graphQLClient = new GraphQLClient(host, { headers })
        return graphQLClient.request('{User(name: "Owner") { email } }')
      }

      describe('not logged in', () => {
        it('rejects', async () => {
          await expect(action()).rejects.toThrow('Not Authorised!')
        })

        it('does not expose the owner\'s email address', async () => {
          try {
            await action()
          } catch (error) {
            console.log(error.response.data)
            expect(error.response.data).toEqual({ User: [ null ] })
          }
        })
      })

      describe('as owner', () => {
        beforeEach(() => {
          loginCredentials = {
            email: 'owner@example.org',
            password: 'iamtheowner'
          }
        })

        it('exposes the owner\'s email address', async () => {
          await expect(action()).resolves.toEqual({ User: [ { email: 'owner@example.org' } ] })
        })
      })

      describe('authenticated as another user', () => {
        beforeEach(async () => {
          loginCredentials = {
            email: 'someone@example.org',
            password: 'else'
          }
        })

        it('rejects', async () => {
          await expect(action()).rejects.toThrow('Not Authorised!')
        })

        it('does not expose the owner\'s email address', async () => {
          try {
            await action()
          } catch (error) {
            expect(error.response.data).toEqual({ User: [ null ] })
          }
        })
      })
    })
  })
})
