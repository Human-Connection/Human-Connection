import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()
let client
let createCommentVariables
let createPostVariables
let createCommentVariablesSansPostId
let createCommentVariablesWithNonExistentPost

beforeEach(async () => {
  await factory.create('User', {
    email: 'test@example.org',
    password: '1234',
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
  const commentQueryForPostId = `
    query($content: String) {
      Comment(content: $content) {
        postId
      }
    }
  `
  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      createCommentVariables = {
        postId: 'p1',
        content: "I'm not authorised to comment",
      }
      client = new GraphQLClient(host)
      await expect(client.request(createCommentMutation, createCommentVariables)).rejects.toThrow(
        'Not Authorised',
      )
    })
  })

  describe('authenticated', () => {
    let headers
    beforeEach(async () => {
      headers = await login({ email: 'test@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
      createCommentVariables = {
        postId: 'p1',
        content: "I'm authorised to comment",
      }
      createPostVariables = {
        id: 'p1',
        title: 'post to comment on',
        content: 'please comment on me',
      }
      await client.request(createPostMutation, createPostVariables)
    })

    it('creates a comment', async () => {
      const expected = {
        CreateComment: {
          content: "I'm authorised to comment",
        },
      }

      await expect(
        client.request(createCommentMutation, createCommentVariables),
      ).resolves.toMatchObject(expected)
    })

    it('assigns the authenticated user as author', async () => {
      await client.request(createCommentMutation, createCommentVariables)

      const { User } = await client.request(`{
          User(email: "test@example.org") {
            comments {
              content
            }
          }
        }`)

      expect(User).toEqual([{ comments: [{ content: "I'm authorised to comment" }] }])
    })

    it('throw an error if an empty string is sent from the editor as content', async () => {
      createCommentVariables = {
        postId: 'p1',
        content: '<p></p>',
      }

      await expect(client.request(createCommentMutation, createCommentVariables)).rejects.toThrow(
        'Comment must be at least 1 character long!',
      )
    })

    it('throws an error if a comment sent from the editor does not contain a single character', async () => {
      createCommentVariables = {
        postId: 'p1',
        content: '<p> </p>',
      }

      await expect(client.request(createCommentMutation, createCommentVariables)).rejects.toThrow(
        'Comment must be at least 1 character long!',
      )
    })

    it('throws an error if postId is sent as an empty string', async () => {
      createCommentVariables = {
        postId: 'p1',
        content: '',
      }

      await expect(client.request(createCommentMutation, createCommentVariables)).rejects.toThrow(
        'Comment must be at least 1 character long!',
      )
    })

    it('throws an error if content is sent as an string of empty characters', async () => {
      createCommentVariables = {
        postId: 'p1',
        content: '    ',
      }

      await expect(client.request(createCommentMutation, createCommentVariables)).rejects.toThrow(
        'Comment must be at least 1 character long!',
      )
    })

    it('throws an error if postId is sent as an empty string', async () => {
      createCommentVariablesSansPostId = {
        postId: '',
        content: 'this comment should not be created',
      }

      await expect(
        client.request(createCommentMutation, createCommentVariablesSansPostId),
      ).rejects.toThrow('Comment cannot be created without a post!')
    })

    it('throws an error if postId is sent as an string of empty characters', async () => {
      createCommentVariablesSansPostId = {
        postId: '   ',
        content: 'this comment should not be created',
      }

      await expect(
        client.request(createCommentMutation, createCommentVariablesSansPostId),
      ).rejects.toThrow('Comment cannot be created without a post!')
    })

    it('throws an error if the post does not exist in the database', async () => {
      createCommentVariablesWithNonExistentPost = {
        postId: 'p2',
        content: "comment should not be created cause the post doesn't exist",
      }

      await expect(
        client.request(createCommentMutation, createCommentVariablesWithNonExistentPost),
      ).rejects.toThrow('Comment cannot be created without a post!')
    })

    it('does not create the comment with the postId as an attribute', async () => {
      const commentQueryVariablesByContent = {
        content: "I'm authorised to comment",
      }

      await client.request(createCommentMutation, createCommentVariables)
      const { Comment } = await client.request(
        commentQueryForPostId,
        commentQueryVariablesByContent,
      )
      expect(Comment).toEqual([{ postId: null }])
    })
  })
})
