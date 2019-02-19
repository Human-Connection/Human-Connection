import { create, cleanDatabase } from '../seed/factories'
import { testServerHost as host, authenticatedHeaders } from '../jest/helpers'
import { GraphQLClient } from 'graphql-request'

let client
let headers
beforeEach(async () => {
  await create('user', {email: 'user@example.org', password: '1234'})
  headers = authenticatedHeaders({email: 'user@example.org', password: '1234'})
  client = new GraphQLClient(host, { headers })
})

afterEach(async () => {
  await cleanDatabase()
})

describe('slugify', () => {
  describe('CreatePost', () => {
    it('generates a slug based on the title', async () => {
      const response = await client.request(`mutation {
        CreatePost(
          title: "I am a brand new post",
          content: "Some content"
        ) { slug }
      }`)
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

      describe('but if the client requested a slug', () => {
        it('rejects CreatePost', async () => {
          try {
            await client.request(`mutation {
              CreatePost(
                title: "Pre-existing post",
                content: "Some content",
                slug: "pre-existing-post"
              ) { slug }
            }`)
          } catch (error) {
            expect(error.response.errors[0].message).toEqual('Not Authorised!')
            expect(error.response.data).toEqual({ User: [ { email: null } ] })
          }
        })
      })
    })
  })
})
