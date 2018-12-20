import { request } from 'graphql-request'
import createServer from './server'

let getHost
let app
let port

beforeEach(async () => {
  const server = createServer()
  app = await server.start({ port: 0 })
  port = app.address().port
  getHost = () => `http://127.0.0.1:${port}`
})

afterEach(async () => {
  await app.close()
})

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
