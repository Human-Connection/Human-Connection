import Factory from '../seed/factories'
import { host, login } from '../jest/helpers'
import { GraphQLClient } from 'graphql-request'

let authenticatedClient
let headers
const factory = Factory()

beforeEach(async () => {
  await factory.create('User', { email: 'user@example.org', password: '1234' })
  await factory.create('User', {
    email: 'someone@example.org',
    password: '1234',
  })
  headers = await login({ email: 'user@example.org', password: '1234' })
  authenticatedClient = new GraphQLClient(host, { headers })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('slugify', () => {
  describe('CreatePost', () => {
    it('generates a slug based on title', async () => {
      const response = await authenticatedClient.request(`mutation {
        CreatePost(
          title: "I am a brand new post",
          content: "Some content"
        ) { slug }
      }`)
      expect(response).toEqual({
        CreatePost: { slug: 'i-am-a-brand-new-post' },
      })
    })

    describe('if slug exists', () => {
      beforeEach(async () => {
        const asSomeoneElse = await Factory().authenticateAs({
          email: 'someone@example.org',
          password: '1234',
        })
        await asSomeoneElse.create('Post', {
          title: 'Pre-existing post',
          slug: 'pre-existing-post',
        })
      })

      it('chooses another slug', async () => {
        const response = await authenticatedClient.request(`mutation {
          CreatePost(
            title: "Pre-existing post",
            content: "Some content"
          ) { slug }
        }`)
        expect(response).toEqual({
          CreatePost: { slug: 'pre-existing-post-1' },
        })
      })

      describe('but if the client specifies a slug', () => {
        it('rejects CreatePost', async () => {
          await expect(
            authenticatedClient.request(`mutation {
              CreatePost(
                title: "Pre-existing post",
                content: "Some content",
                slug: "pre-existing-post"
              ) { slug }
            }`),
          ).rejects.toThrow('already exists')
        })
      })
    })
  })

  describe('CreateUser', () => {
    const action = async (mutation, params) => {
      return authenticatedClient.request(`mutation {
        ${mutation}(password: "yo", email: "123@123.de", ${params}) { slug }
      }`)
    }
    it('generates a slug based on name', async () => {
      await expect(action('CreateUser', 'name: "I am a user"')).resolves.toEqual({
        CreateUser: { slug: 'i-am-a-user' },
      })
    })

    describe('if slug exists', () => {
      beforeEach(async () => {
        await action('CreateUser', 'name: "Pre-existing user", slug: "pre-existing-user"')
      })

      it('chooses another slug', async () => {
        await expect(action('CreateUser', 'name: "pre-existing-user"')).resolves.toEqual({
          CreateUser: { slug: 'pre-existing-user-1' },
        })
      })

      describe('but if the client specifies a slug', () => {
        it('rejects CreateUser', async () => {
          await expect(
            action('CreateUser', 'name: "Pre-existing user", slug: "pre-existing-user"'),
          ).rejects.toThrow('already exists')
        })
      })
    })
  })
})
