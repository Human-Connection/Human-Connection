import { createTestClient } from 'apollo-server-testing'
import createServer from './server'

/**
 * This file is for demonstration purposes. It does not really test the
 * `isLoggedIn` query but demonstrates how we can use `apollo-server-testing`.
 * All we need to do is to get an instance of `ApolloServer` and maybe we want
 * stub out `context` as shown below.
 *
 */

let user
let action
describe('isLoggedIn', () => {
  beforeEach(() => {
    action = async () => {
      const { server } = createServer({
        context: () => {
          return {
            user,
          }
        },
      })
      const { query } = createTestClient(server)

      const isLoggedIn = `{ isLoggedIn }`
      return query({ query: isLoggedIn })
    }
  })

  it('returns false', async () => {
    const expected = expect.objectContaining({ data: { isLoggedIn: false } })
    await expect(action()).resolves.toEqual(expected)
  })

  describe('when authenticated', () => {
    it('returns true', async () => {
      user = { id: '123' }
      const expected = expect.objectContaining({ data: { isLoggedIn: true } })
      await expect(action()).resolves.toEqual(expected)
    })
  })
})
