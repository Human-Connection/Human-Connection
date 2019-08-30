import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login, gql } from '../../jest/helpers'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'

const driver = getDriver()
const neode = getNeode()
const factory = Factory()

let client
let headers
const categoryIds = ['cat9']

let variables
let mutate
let authenticatedUser

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      return {
        driver,
        user: authenticatedUser,
      }
    },
  })
  const client = createTestClient(server)
  mutate = client.mutate
})

beforeEach(async () => {
  variables = {}
  await neode.create('Category', {
    id: 'cat9',
    name: 'Democracy & Politics',
    icon: 'university',
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

const createCommentMutation = gql`
  mutation($id: ID, $postId: ID!, $content: String!) {
    CreateComment(id: $id, postId: $postId, content: $content) {
      id
      content
      author {
        name
      }
    }
  }
`
describe('CreateComment', () => {
  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      variables = {
        ...variables,
        postId: 'p1',
        content: "I'm not authorised to comment",
      }
      const result = await mutate({ mutation: createCommentMutation, variables })
      expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      const user = await neode.create('User', { name: 'Author' })
      authenticatedUser = await user.toJson()
    })

    describe('given a post', () => {
      beforeEach(async () => {
        await factory.create('Post', { categoryIds, id: 'p1' })
        variables = {
          ...variables,
          postId: 'p1',
          content: "I'm authorised to comment",
        }
      })

      it('creates a comment', async () => {
        await expect(mutate({ mutation: createCommentMutation, variables })).resolves.toMatchObject(
          {
            data: { CreateComment: { content: "I'm authorised to comment" } },
          },
        )
      })

      it('assigns the authenticated user as author', async () => {
        await expect(mutate({ mutation: createCommentMutation, variables })).resolves.toMatchObject(
          {
            data: { CreateComment: { author: { name: 'Author' } } },
          },
        )
      })

      describe('comment content is empty', () => {
        beforeEach(() => {
          variables = { ...variables, content: '<p></p>' }
        })

        it('throw UserInput error', async () => {
          const { data, errors } = await mutate({ mutation: createCommentMutation, variables })
          expect(data).toEqual({ CreateComment: null })
          expect(errors[0]).toHaveProperty('message', 'Comment must be at least 1 character long!')
        })
      })

      describe('comment content contains only whitespaces', () => {
        beforeEach(() => {
          variables = { ...variables, content: '   <p>   </p>   ' }
        })

        it('throw UserInput error', async () => {
          const { data, errors } = await mutate({ mutation: createCommentMutation, variables })
          expect(data).toEqual({ CreateComment: null })
          expect(errors[0]).toHaveProperty('message', 'Comment must be at least 1 character long!')
        })
      })

      describe('invalid post id', () => {
        beforeEach(() => {
          variables = { ...variables, postId: 'does-not-exist' }
        })

        it('throw UserInput error', async () => {
          const { data, errors } = await mutate({ mutation: createCommentMutation, variables })
          expect(data).toEqual({ CreateComment: null })
          expect(errors[0]).toHaveProperty('message', 'Comment cannot be created without a post!')
        })
      })
    })
  })
})

describe('ManageComments', () => {
  let authorParams
  beforeEach(async () => {
    authorParams = {
      email: 'author@example.org',
      password: '1234',
    }
    const asAuthor = Factory()
    await asAuthor.create('User', authorParams)
    await asAuthor.authenticateAs(authorParams)
    await asAuthor.create('Post', {
      id: 'p1',
      content: 'Post to be commented',
      categoryIds,
    })
    await asAuthor.create('Comment', {
      id: 'c456',
      postId: 'p1',
      content: 'Comment to be deleted',
    })
  })

  describe('UpdateComment', () => {
    const updateCommentMutation = gql`
      mutation($content: String!, $id: ID!) {
        UpdateComment(content: $content, id: $id) {
          id
          content
        }
      }
    `

    let updateCommentVariables = {
      id: 'c456',
      content: 'The comment is updated',
    }

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(updateCommentMutation, updateCommentVariables)).rejects.toThrow(
          'Not Authorised',
        )
      })
    })

    describe('authenticated but not the author', () => {
      beforeEach(async () => {
        headers = await login({
          email: 'test@example.org',
          password: '1234',
        })
        client = new GraphQLClient(host, {
          headers,
        })
      })

      it('throws authorization error', async () => {
        await expect(client.request(updateCommentMutation, updateCommentVariables)).rejects.toThrow(
          'Not Authorised',
        )
      })
    })

    describe('authenticated as author', () => {
      beforeEach(async () => {
        headers = await login(authorParams)
        client = new GraphQLClient(host, {
          headers,
        })
      })

      it('updates the comment', async () => {
        const expected = {
          UpdateComment: {
            id: 'c456',
            content: 'The comment is updated',
          },
        }
        await expect(
          client.request(updateCommentMutation, updateCommentVariables),
        ).resolves.toEqual(expected)
      })

      it('throw an error if an empty string is sent from the editor as content', async () => {
        updateCommentVariables = {
          id: 'c456',
          content: '<p></p>',
        }

        await expect(client.request(updateCommentMutation, updateCommentVariables)).rejects.toThrow(
          'Comment must be at least 1 character long!',
        )
      })

      it('throws an error if a comment sent from the editor does not contain a single letter character', async () => {
        updateCommentVariables = {
          id: 'c456',
          content: '<p> </p>',
        }

        await expect(client.request(updateCommentMutation, updateCommentVariables)).rejects.toThrow(
          'Comment must be at least 1 character long!',
        )
      })

      it('throws an error if commentId is sent as an empty string', async () => {
        updateCommentVariables = {
          id: '',
          content: '<p>Hello</p>',
        }

        await expect(client.request(updateCommentMutation, updateCommentVariables)).rejects.toThrow(
          'Not Authorised!',
        )
      })

      it('throws an error if the comment does not exist in the database', async () => {
        updateCommentVariables = {
          id: 'c1000',
          content: '<p>Hello</p>',
        }

        await expect(client.request(updateCommentMutation, updateCommentVariables)).rejects.toThrow(
          'Not Authorised!',
        )
      })
    })
  })

  describe('DeleteComment', () => {
    const deleteCommentMutation = gql`
      mutation($id: ID!) {
        DeleteComment(id: $id) {
          id
        }
      }
    `

    const deleteCommentVariables = {
      id: 'c456',
    }

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(deleteCommentMutation, deleteCommentVariables)).rejects.toThrow(
          'Not Authorised',
        )
      })
    })

    describe('authenticated but not the author', () => {
      beforeEach(async () => {
        headers = await login({
          email: 'test@example.org',
          password: '1234',
        })
        client = new GraphQLClient(host, {
          headers,
        })
      })

      it('throws authorization error', async () => {
        await expect(client.request(deleteCommentMutation, deleteCommentVariables)).rejects.toThrow(
          'Not Authorised',
        )
      })
    })

    describe('authenticated as author', () => {
      beforeEach(async () => {
        headers = await login(authorParams)
        client = new GraphQLClient(host, {
          headers,
        })
      })

      it('deletes the comment', async () => {
        const expected = {
          DeleteComment: {
            id: 'c456',
          },
        }
        await expect(
          client.request(deleteCommentMutation, deleteCommentVariables),
        ).resolves.toEqual(expected)
      })
    })
  })
})
