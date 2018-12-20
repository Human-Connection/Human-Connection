import { request } from 'graphql-request'
import server from './server'

describe('login', () => {
  describe('asking for a `token`', () => {
    describe('with valid email/password combination', () => {
      xit('responds with a JWT token', () => {})
    })

    describe('with a valid email but incorrect password', () => {
      beforeEach(() => {
        // create a user in the database
      })
      xit('responds with "Wrong email/password combination"', () => {})
    })

    describe('with a non-existing email', () => {
      let getHost

      beforeEach(async () => {
        const app = await server.start({ port: 0 })
        const { port } = app.address()
        getHost = () => `http://127.0.0.1:${port}`
      })

      const mutation = `
      mutation {
        login(email:"user@example.com", password:"asdfasd"){
          token
        }
      }`

      it('responds with "Wrong email/password combination"', async () => {
        try {
          await request(getHost(), mutation)
        } catch (error) {
          expect(error.response.errors[0].message).toEqual('Wrong email/password combination')
        }
      })
    })
  })
})
