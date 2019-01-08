import { request } from 'graphql-request'
import createServer from '../server'
import mocks from '../mocks'
import { create, cleanDatabase } from '../seed/factories'
import generateJwt from '../jwt/generateToken'

describe('authorization', () => {
  describe('given an existing user', () => {

    describe('logged in', () => {
      let jwt
      beforeEach(() => {
        // jwt = generateJwt(user)
      })

      describe('query own user profile', () => {
        const mutation = (params) => {
          const { email, password } = params
          return `{
                    User(email: "${email}") {
                      name
                    }
                  }`
        }

        it('returns the owner\'s email address', async () => {
          // const data = await request(getHost(), mutation({ email: 'test@example.org' }))
          console.log('it runs')
        })
      })
    })
  })
})
