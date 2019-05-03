import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()
let client
let createCommentVariables
let createPostVariables

beforeEach(async () => {
  await factory.create('User', {
    email: 'test@example.org',
    password: '1234'
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('CreateComment', () => {
  const createCommentMutation = `
  mutation($postId: ID, $content: String!) {
    CreateComment(postId: $postId, content: $content) {
      id
      content
    }
  }
  `
  const createPostMutation = `
  mutation($id: ID!, $title: String!, $content: String!) {
    CreatePost(id: $id, title: $title, content: $content) {
      id
    }
  }
  `
  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      createCommentVariables = {
        postId: 'p1',
        content: 'I\'m not authorised to comment'
      }
      client = new GraphQLClient(host)
      await expect(client.request(createCommentMutation, createCommentVariables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated', () => {
    let headers
    beforeEach(async () => {
      headers = await login({ email: 'test@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
      createCommentVariables = {
        postId: 'p1',
        content: 'I\'m authorised to comment'
      }
    })

    it('creates a comment', async () => {
      const expected = {
        CreateComment: {
          content: 'I\'m authorised to comment'
        }
      }

      await expect(client.request(createCommentMutation, createCommentVariables)).resolves.toMatchObject(expected)
    })

    it('assigns the authenticated user as author', async () => {
      createPostVariables = {
        id: 'p1',
        title: 'post to comment on',
        content: 'please comment on me'
      }
      await client.request(createPostMutation, createPostVariables)
      await client.request(createCommentMutation, createCommentVariables)

      const { User } = await client.request(`{
          User(email: "test@example.org") {
            comments {
              content
            }
          }
        }`)

      expect(User).toEqual([ { comments: [ { content: 'I\'m authorised to comment' } ] } ])
    })

    it('throw an error if an empty string is sent as content', async () => {
      createCommentVariables = {
        postId: 'p1',
        content: '<p></p>'
      }

      await expect(client.request(createCommentMutation, createCommentVariables))
        .rejects.toThrow('Comment must be at least 1 character long!')
    })

    it('throws an error if a comment does not contain a single character', async () => {
      createCommentVariables = {
        postId: 'p1',
        content: '<p> </p>'
      }

      await expect(client.request(createCommentMutation, createCommentVariables))
        .rejects.toThrow('Comment must be at least 1 character long!')
    })
  })
})
