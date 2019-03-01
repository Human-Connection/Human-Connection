import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()

beforeEach(async () => {
  await factory.create('User', {
    email: 'test@example.org',
    password: '1234'
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
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
        headers = await login({ email: 'test@example.org', password: '1234' })
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
