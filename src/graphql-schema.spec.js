import { GraphQLClient, request } from 'graphql-request'
import { create, cleanDatabase } from './seed/factories'
import jwt from 'jsonwebtoken'
import { host, login } from './jest/helpers'

describe('login', () => {
  const mutation = (params) => {
    const { email, password } = params
    return `
      mutation {
        login(email:"${email}", password:"${password}"){
          token
        }
      }`
  }

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
          const data = await request(host, mutation({ email: 'test@example.org', password: '1234' }))
          const { token } = data.login
          jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            expect(data.email).toEqual('test@example.org')
            expect(err).toBeNull()
          })
        })
      })

      describe('with a valid email but incorrect password', () => {
        it('responds with "Incorrect email address or password."', async () => {
          try {
            await request(host, mutation({ email: 'test@example.org', password: 'wrong' }))
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Incorrect email address or password.')
          }
        })
      })

      describe('with a non-existing email', () => {
        it('responds with "Incorrect email address or password."', async () => {
          try {
            await request(host, mutation({ email: 'non-existent@example.org', password: 'wrong' }))
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Incorrect email address or password.')
          }
        })
      })
    })
  })
})

describe('report', () => {
  beforeEach(async () => {
    await create('user', {
      email: 'test@example.org',
      password: '1234'
    })
  })

  afterEach(async () => {
    await cleanDatabase()
  })
  
  describe('unauthenticated', () => {
    let client
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(
        client.request(`mutation {
        report(
          description: "I don't like this user",
          resource: {
            id: "u1",
            type: user
          }
        ) { id, createdAt }
      }`)
      ).rejects.toThrow('Not Authorised')
    })
    
    describe('authenticated', () => {
      let headers
      let response
      beforeEach(async () => {
        headers = await login({ email: 'test@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
        response = await client.request(`mutation {
          report(
            description: "I don't like this user",
            resource: {
              id: "u1",
              type: user
            }
            ) { id, createdAt }
          }`,
          { headers }
          )
        })
      it('creates a report', () => {
        let { id, createdAt } = response.report
        expect(response).toEqual({
          report: { id, createdAt }
        })
      })
    })
  })
})
