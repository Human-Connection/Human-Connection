import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

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
              id
              post {
                id
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
        beforeEach(async () => {
          const content = 'Hey @al-capone how do you do?'
          const title = 'Mentioning Al Capone'
          const createPostMutation = `
          mutation($title: String!, $content: String!) {
            CreatePost(title: $title, content: $content) {
              title
              content
            }
          }
          `
          authorClient = new GraphQLClient(host, authorHeaders)
          await authorClient.request(createPostMutation, { title, content })
        })

        it('sends you a notification', async () => {
          const expected = {
            currentUser: {
              notifications: [
                { read: false, post: { content: 'Hey @al-capone how do you do?' } }
              ]
            }
          }
          await expect(client.request(query, { read: false })).resolves.toEqual(expected)
        })
      })
    })
  })
})
