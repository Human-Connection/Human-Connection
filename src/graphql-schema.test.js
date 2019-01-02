import { request } from 'graphql-request'
import createServer from './server'
import mocks from './mocks'
import { create, cleanDatabase } from './seed/factories'

let getHost
let app
let port

beforeEach(async () => {
  const server = createServer({mocks})
  app = await server.start({ port: 0 })
  port = app.address().port
  getHost = () => `http://127.0.0.1:${port}`
})

afterEach(async () => {
  await app.close()
})

describe.only('login', () => {
  let email
  let password
  const mutation = `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  describe('given an existing user', () => {
    beforeEach(async () => {
      await create('user', {
        email: 'test@example.org',
        password: '1234'
      })
    })

    afterEach(async () => {
      await cleanDatabase()
    })

    describe('asking for a `token`', () => {
      describe('with valid email/password combination', () => {
        it('responds with a JWT token', async () => {
          email = 'user@example.org'
          password = '1234'
          try {
            await request(getHost(), mutation)
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Wrong email/password combination')
          }
        })
      })

      describe('with a valid email but incorrect password', () => {
        it('responds with "Wrong email/password combination"', async () => {
          email = 'user@example.org'
          password = 'wrong'
          try {
            await request(getHost(), mutation)
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Wrong email/password combination')
          }
        })
      })

      describe('with a non-existing email', () => {
        it('responds with "Wrong email/password combination"', async () => {
          email = 'non-existent@example.org'
          password = '1234'
          try {
            await request(getHost(), mutation)
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Wrong email/password combination')
          }
        })
      })
    })
  })
})
