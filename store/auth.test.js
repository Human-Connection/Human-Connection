import { getters, mutations, actions } from './auth.js'

let state
let commit
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUxIiwic2x1ZyI6InBldGVyLWx1c3RpZyIsIm5hbWUiOiJQZXRlciBMdXN0aWciLCJhdmF0YXIiOiJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vdWlmYWNlcy9mYWNlcy90d2l0dGVyL2FudG9ueXpvdG92LzEyOC5qcGciLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUub3JnIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTQ1MTQwMTQ5LCJleHAiOjE2MzE1NDAxNDksImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDAwMCIsInN1YiI6InUxIn0.t1nDgdRPNxXGbNzHHN6uSt5fmS4ofFNLjk_k5XnCoCs"

beforeEach(() => {
  commit = jest.fn()
})

describe('getters', () => {
  describe('isAuthenticated', () => {
    describe('given JWT Bearer token', () => {
      test('true', () => {
        state = { token }
        expect(getters.isAuthenticated(state)).toBe(true)
      })
    })
  })
})

describe('actions', () => {
  let action

  describe('login', () => {
    describe('given a successful response', () => {
      let mutate
      let onLogin

      beforeEach(() => {
        mutate = jest.fn(() => Promise.resolve( { data: { login: { token } } }))
        onLogin = jest.fn(() => Promise.resolve())
        const module = {
          app: {
            apolloProvider: { defaultClient: { mutate } },
            $apolloHelpers: { onLogin }
          }
        }
        action = actions.login.bind(module)
      })

      afterEach(() => {
        action = null
      })

      it('saves the JWT Bearer token', async () => {
        await action({commit}, {email: 'doesnot@matter.org', password: '1234'})
        const expected = [
          ['SET_PENDING', true],
          ['SET_USER', null],
          ['SET_TOKEN', null],
          ['SET_TOKEN', token],
          ['SET_USER', { }],
          ['SET_PENDING', false]
        ]
        expect(commit.mock.calls).toEqual(expected)
      })
    })
  })
})
