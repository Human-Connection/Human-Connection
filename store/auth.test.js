import { getters, mutations, actions } from './auth.js'

let state
let commit

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUzIiwic2x1ZyI6Implbm55LXJvc3RvY2siLCJuYW1lIjoiSmVubnkgUm9zdG9jayIsImF2YXRhciI6Imh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS91aWZhY2VzL2ZhY2VzL3R3aXR0ZXIvbXV0dV9rcmlzaC8xMjguanBnIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUub3JnIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1NDUxNDQ2ODgsImV4cCI6MTYzMTU0NDY4OCwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo0MDAwIiwic3ViIjoidTMifQ.s5_JeQN9TaUPfymAXPOpbMAwhmTIg9cnOvNEcj4z75k'
const successfulLoginResponse = {
  data: {
    login: {
      id: 'u3',
      name: 'Jenny Rostock',
      slug: 'jenny-rostock',
      email: 'user@example.org',
      avatar:
        'https://s3.amazonaws.com/uifaces/faces/twitter/mutu_krish/128.jpg',
      role: 'user',
      token
    }
  }
}
const incorrectPasswordResponse = {
  data: {
    login: null
  },
  errors: [
    {
      message: 'Incorrect password.',
      locations: [
        {
          line: 2,
          column: 3
        }
      ],
      path: ['login']
    }
  ]
}

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
    describe('given valid credentials and a successful response', () => {
      beforeEach(async () => {
        const response = Object.assign({}, successfulLoginResponse)
        const mutate = jest.fn(() => Promise.resolve(response))
        const onLogin = jest.fn(() => Promise.resolve())
        const module = {
          app: {
            apolloProvider: { defaultClient: { mutate } },
            $apolloHelpers: { onLogin }
          }
        }
        action = actions.login.bind(module)
        await action(
          { commit },
          { email: 'user@example.org', password: '1234' }
        )
      })

      afterEach(() => {
        action = null
      })

      it('saves the JWT Bearer token', () => {
        expect(commit.mock.calls).toEqual(
          expect.arrayContaining([['SET_TOKEN', token]])
        )
      })

      it('saves user data without token', () => {
        expect(commit.mock.calls).toEqual(
          expect.arrayContaining([
            [
              'SET_USER',
              {
                id: 'u3',
                name: 'Jenny Rostock',
                slug: 'jenny-rostock',
                email: 'user@example.org',
                avatar:
                  'https://s3.amazonaws.com/uifaces/faces/twitter/mutu_krish/128.jpg',
                role: 'user'
              }
            ]
          ])
        )
      })

      it('saves pending flags in order', () => {
        expect(commit.mock.calls).toEqual(
          expect.arrayContaining([
            ['SET_PENDING', true],
            ['SET_PENDING', false]
          ])
        )
      })
    })

    describe('given invalid credentials and incorrect password response', () => {
      beforeEach(() => {
        const response = Object.assign({}, incorrectPasswordResponse)
        const mutate = jest.fn(() => Promise.resolve(response))
        const onLogin = jest.fn(() => Promise.resolve())
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

      xit('shows a user friendly error message', async () => {
        await action(
          { commit },
          { email: 'user@example.org', password: 'wrong' }
        )
      })

      it('saves pending flags in order', async () => {
        try {
          await action(
            { commit },
            { email: 'user@example.org', password: 'wrong' }
          )
        } catch (err) {
          console.log(err)
        }
        expect(commit.mock.calls).toEqual(
          expect.arrayContaining([
            ['SET_PENDING', true],
            ['SET_PENDING', false]
          ])
        )
      })
    })
  })
})
