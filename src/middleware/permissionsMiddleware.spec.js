import { create, cleanDatabase } from '../seed/factories'
import { authenticatedHeaders, queryServer } from '../jest/helpers'

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
      let headers = {}

      beforeEach(async () => {
        // headers = authenticatedHeaders({
        //   email: 'test@example.org',
        //   password: '1234'
        // })
      })

      describe('query email', async () => {
        it('exposes the owner\'s email address', async () => {
          const options = {
            headers,
            query: `{
                    User(email: "test@example.org") {
                      email
                    }
                  }`
          }
          const json = await queryServer(options)
          expect(json).toEqual({ User: [ { email: 'test@example.org' } ] })
        })
      })
    })
  })
})
