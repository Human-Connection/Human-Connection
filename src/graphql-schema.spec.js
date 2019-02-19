import { create, cleanDatabase } from './seed/factories'
import jwt from 'jsonwebtoken'
import { testServerHost as host, authenticatedHeaders } from './jest/helpers'
import { GraphQLClient, request } from 'graphql-request'

beforeEach(async () => {
  await create('user', {
    email: 'test@example.org',
    password: '1234'
  })
})

afterEach(async () => {
  await cleanDatabase()
})

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

  describe('ask for a `token`', () => {
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

describe('CreatePost', () => {
  describe('unauthenticated', () => {
    let client
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(`mutation {
        CreatePost(
          title: "I am a post",
          content: "Some content"
        ) { slug }
      }`)).rejects.toThrow('Not Authorised')
    })

    describe('authenticated', () => {
      let headers
      let response
      beforeEach(async () => {
        headers = await authenticatedHeaders({ email: 'test@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
        response = await client.request(`mutation {
        CreatePost(
          title: "A title",
          content: "Some content"
        ) { title, content }
      }`, { headers })
      })

      it('creates a post', () => {
        expect(response).toEqual({ CreatePost: { title: 'A title', content: 'Some content' } })
      })

      it('assigns the authenticated user as author', async () => {
        const { User } = await client.request(`{
          User(email:"test@example.org") {
            contributions {
              title
            }
          }
        }`, { headers })
        expect(User).toEqual([ { contributions: [ { title: 'A title' } ] } ])
      })
    })
  })
})
