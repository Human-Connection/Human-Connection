import { GraphQLClient } from 'graphql-request'
import { host, login } from '../../jest/helpers'
import Factory from '../../seed/factories'

const factory = Factory()
let client

beforeEach(async () => {
  await factory.create('User', {
    id: 'you',
    name: 'Al Capone',
    slug: 'al-capone',
    email: 'test@example.org',
    password: '1234'
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('currentUser { notifications }', () => {
  const query = `query($read: Boolean) {
          currentUser {
            notifications(read: $read, orderBy: createdAt_desc) {
              read
              post {
                content
              }
            }
          }
        }`

  describe('authenticated', () => {
    let headers
    beforeEach(async () => {
      headers = await login({ email: 'test@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
    })

    describe('given another user', () => {
      let authorClient
      let authorParams
      let authorHeaders

      beforeEach(async () => {
        authorParams = {
          email: 'author@example.org',
          password: '1234',
          id: 'author'
        }
        await factory.create('User', authorParams)
        authorHeaders = await login(authorParams)
      })

      describe('who mentions me in a post', () => {
        let post
        const title = 'Mentioning Al Capone'
        const content = 'Hey <a class="mention" href="/profile/you/al-capone">@al-capone</a> how do you do?'

        beforeEach(async () => {
          const createPostMutation = `
          mutation($title: String!, $content: String!) {
            CreatePost(title: $title, content: $content) {
              id
              title
              content
            }
          }
          `
          authorClient = new GraphQLClient(host, { headers: authorHeaders })
          const { CreatePost } = await authorClient.request(createPostMutation, { title, content })
          post = CreatePost
        })

        it('sends you a notification', async () => {
          const newContent = 'Hey <a href="/profile/you/al-capone" target=\"_blank\">@al-capone</a> how do you do?'
          const expected = {
            currentUser: {
              notifications: [
                { read: false, post: { content: newContent } }
              ]
            }
          }
          await expect(client.request(query, { read: false })).resolves.toEqual(expected)
        })
      })
    })
  })
})
