import { GraphQLClient } from 'graphql-request'
import { create, cleanDatabase } from '../seed/factories'
import { host, login } from '../jest/helpers'

describe('authorization', () => {
  describe('given two existing users', () => {
    beforeEach(async () => {
      await create('user', {
        email: 'test@example.org',
        password: '1234'
      })
      await create('user', {
        email: 'someone@example.org',
        password: 'hello'
      })
    })

    afterEach(async () => {
      await cleanDatabase()
    })

    describe('logged in', () => {
      let jwt, graphQLClient

      beforeEach(async () => {
        jwt = await login({ email: 'test@example.org', password: '1234' })
        graphQLClient = new GraphQLClient(host, {
          headers: {
            authorization: `Bearer ${jwt}`
          }
        })
      })

      describe('query email', () => {
        const query = (params) => {
          const { email } = params
          return `{
                    User(email: "${email}") {
                      email
                    }
                  }`
        }

        it('exposes the owner\'s email address', async () => {
          const data = await graphQLClient.request(query({ email: 'test@example.org' }))
          console.log(process.env)
          expect(data).toEqual({ User: [ { email: 'test@example.org' } ] })
        })
      })
    })
  })
})
