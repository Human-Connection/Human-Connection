import { create, cleanDatabase } from '../seed/factories'
import { authenticatedGraphQLClient } from '../jest/helpers'

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
      let graphQLClient

      beforeEach(async () => {
        graphQLClient = await authenticatedGraphQLClient({ email: 'test@example.org', password: '1234' })
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
          expect(data).toEqual({ User: [ { email: 'test@example.org' } ] })
        })
      })
    })
  })
})
