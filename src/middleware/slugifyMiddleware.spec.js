import { create, cleanDatabase } from '../seed/factories'
import { testServerHost as host, authenticatedHeaders } from '../jest/helpers'
import { GraphQLClient } from 'graphql-request'

let client
let headers
beforeEach(async () => {
  await create('user', { email: 'user@example.org', password: '1234' })
  headers = await authenticatedHeaders({ email: 'user@example.org', password: '1234' })
  client = new GraphQLClient(host, { headers })
})

afterEach(async () => {
  await cleanDatabase()
})

describe('slugify', () => {
  describe('CreatePost', () => {
    it('generates a slug based on title', async () => {
      const response = await client.request(`mutation {
        CreatePost(
          title: "I am a brand new post",
          content: "Some content"
        ) { slug }
      }`, { headers })
      expect(response).toEqual({ CreatePost: { slug: 'i-am-a-brand-new-post' } })
    })

    describe('if slug exists', () => {
      beforeEach(async () => {
        await create('post', {
          title: 'Pre-existing post',
          slug: 'pre-existing-post'
        }, { headers })
      })

      it('chooses another slug', async () => {
        const response = await client.request(`mutation {
          CreatePost(
            title: "Pre-existing post",
            content: "Some content"
          ) { slug }
        }`)
        expect(response).toEqual({ CreatePost: { slug: 'pre-existing-post-1' } })
      })

      describe('but if the client specifies a slug', () => {
        it('rejects CreatePost', async () => {
          await expect(client.request(`mutation {
              CreatePost(
                title: "Pre-existing post",
                content: "Some content",
                slug: "pre-existing-post"
              ) { slug }
            }`)
          ).rejects.toThrow('already exists')
        })
      })
    })
  })

  describe('CreateUser', () => {
    const action = async (mutation, params) => {
      return client.request(`mutation {
        ${mutation}(password: "yo", ${params}) { slug }
      }`, { headers })
    }
    it('generates a slug based on name', async () => {
      await expect(action('CreateUser', 'name: "I am a user"'))
        .resolves.toEqual({ CreateUser: { slug: 'i-am-a-user' } })
    })

    describe('if slug exists', () => {
      beforeEach(async () => {
        await action('CreateUser', 'name: "Pre-existing user", slug: "pre-existing-user"')
      })

      it('chooses another slug', async () => {
        await expect(action(
          'CreateUser',
          'name: "pre-existing-user"'
        )).resolves.toEqual({ CreateUser: { slug: 'pre-existing-user-1' } })
      })

      describe('but if the client specifies a slug', () => {
        it('rejects CreateUser', async () => {
          await expect(action(
            'CreateUser',
            'name: "Pre-existing user", slug: "pre-existing-user"'
          )).rejects.toThrow('already exists')
        })
      })
    })
  })
})
