import { create, cleanDatabase } from '../seed/factories'
import { authenticatedHeaders, queryServer } from '../jest/helpers'

describe('authorization', () => {
  describe('given two existing users', () => {
    beforeEach(async () => {
      await create('user', {
        email: 'owner@example.org',
        password: 'iamtheowner'
      })
      await create('user', {
        email: 'someone@example.org',
        password: 'else'
      })
    })

    afterEach(async () => {
      await cleanDatabase()
    })

    describe('access email address', () => {
      let headers = {}
      const action = async (headers) => {
        const options = {
          headers,
          query: `{
                    User(email: "owner@example.org") {
                      email
                    }
                  }`
        }
        return await queryServer(options)
      }

      describe('not logged in', async () => {
        it('does not expose the owner\'s email address', async () => {
          expect(await action(headers)).toEqual({ User: [ { email: null } ] })
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
          expect(await action(headers)).toEqual({ User: [ { email: null } ] })
        })
      })
    })
  })
})
