import { GraphQLClient } from 'graphql-request'
import Factory from '../seed/factories'
import { host, login } from '../jest/helpers'
import { neode } from '../bootstrap/neo4j'

let authenticatedClient
let headers
const factory = Factory()
const instance = neode()

beforeEach(async () => {
  const adminParams = { role: 'admin', email: 'admin@example.org', password: '1234' }
  await factory.create('User', adminParams)
  await factory.create('User', {
    email: 'someone@example.org',
    password: '1234',
  })
  // we need to be an admin, otherwise we're not authorized to create a user
  headers = await login(adminParams)
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

  describe('SignupVerification', () => {
    const mutation = `mutation($password: String!, $email: String!, $name: String!, $slug: String, $nonce: String!) {
      SignupVerification(email: $email, password: $password, name: $name, slug: $slug, nonce: $nonce) { slug }
    }
    `

    const action = async variables => {
      // required for SignupVerification
      await instance.create('EmailAddress', { email: '123@example.org', nonce: '123456' })

      const defaultVariables = { nonce: '123456', password: 'yo', email: '123@example.org' }
      return authenticatedClient.request(mutation, { ...defaultVariables, ...variables })
    }

    it('generates a slug based on name', async () => {
      await expect(action({ name: 'I am a user' })).resolves.toEqual({
        SignupVerification: { slug: 'i-am-a-user' },
      })
    })

    describe('if slug exists', () => {
      beforeEach(async () => {
        await factory.create('User', { name: 'pre-existing user', slug: 'pre-existing-user' })
      })

      it('chooses another slug', async () => {
        await expect(action({ name: 'pre-existing-user' })).resolves.toEqual({
          SignupVerification: { slug: 'pre-existing-user-1' },
        })
      })

      describe('but if the client specifies a slug', () => {
        it('rejects SignupVerification', async () => {
          await expect(
            action({ name: 'Pre-existing user', slug: 'pre-existing-user' }),
          ).rejects.toThrow('already exists')
        })
      })
    })
  })
})
