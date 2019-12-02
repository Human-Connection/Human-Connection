import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'
import { getNeode, getDriver } from '../../bootstrap/neo4j'

const driver = getDriver()
const neode = getNeode()
const factory = Factory()

let variables, mutate, authenticatedUser, commentAuthor, newlyCreatedComment

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
const setupPostAndComment = async () => {
  commentAuthor = await factory.create('User')
  await factory.create('Post', {
    id: 'p1',
    content: 'Post to be commented',
    categoryIds: ['cat9'],
  })
  newlyCreatedComment = await factory.create('Comment', {
    id: 'c456',
    postId: 'p1',
    author: commentAuthor,
    content: 'Comment to be deleted',
  })
  variables = {
    ...variables,
    id: 'c456',
    content: 'The comment is updated',
  }
}

describe('CreateComment', () => {
  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      variables = {
        ...variables,
        postId: 'p1',
        content: "I'm not authorised to comment",
      }
      const { errors } = await mutate({ mutation: createCommentMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      const user = await neode.create('User', { name: 'Author' })
      authenticatedUser = await user.toJson()
    })

    describe('given a post', () => {
      beforeEach(async () => {
        await factory.create('Post', { categoryIds: ['cat9'], id: 'p1' })
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
    })
  })
})

describe('UpdateComment', () => {
  const updateCommentMutation = gql`
    mutation($content: String!, $id: ID!) {
      UpdateComment(content: $content, id: $id) {
        id
        content
        createdAt
        updatedAt
      }
    }
  `

  describe('given a post and a comment', () => {
    beforeEach(setupPostAndComment)

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        const { errors } = await mutate({ mutation: updateCommentMutation, variables })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated but not the author', () => {
      beforeEach(async () => {
        const randomGuy = await factory.create('User')
        authenticatedUser = await randomGuy.toJson()
      })

      it('throws authorization error', async () => {
        const { errors } = await mutate({ mutation: updateCommentMutation, variables })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated as author', () => {
      beforeEach(async () => {
        authenticatedUser = await commentAuthor.toJson()
      })

      it('updates the comment', async () => {
        const expected = {
          data: { UpdateComment: { id: 'c456', content: 'The comment is updated' } },
        }
        await expect(mutate({ mutation: updateCommentMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })

      it('updates a comment, but maintains non-updated attributes', async () => {
        const expected = {
          data: {
            UpdateComment: {
              id: 'c456',
              content: 'The comment is updated',
              createdAt: expect.any(String),
            },
          },
        }
        await expect(mutate({ mutation: updateCommentMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })

      it('updates the updatedAt attribute', async () => {
        newlyCreatedComment = await newlyCreatedComment.toJson()
        const {
          data: { UpdateComment },
        } = await mutate({ mutation: updateCommentMutation, variables })
        expect(newlyCreatedComment.updatedAt).toBeTruthy()
        expect(Date.parse(newlyCreatedComment.updatedAt)).toEqual(expect.any(Number))
        expect(UpdateComment.updatedAt).toBeTruthy()
        expect(Date.parse(UpdateComment.updatedAt)).toEqual(expect.any(Number))
        expect(newlyCreatedComment.updatedAt).not.toEqual(UpdateComment.updatedAt)
      })

      describe('if comment does not exist for given id', () => {
        beforeEach(() => {
          variables = { ...variables, id: 'does-not-exist' }
        })

        it('returns null', async () => {
          const { data, errors } = await mutate({ mutation: updateCommentMutation, variables })
          expect(data).toMatchObject({ UpdateComment: null })
          expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
        })
      })
    })
  })
})

describe('DeleteComment', () => {
  const deleteCommentMutation = gql`
    mutation($id: ID!) {
      DeleteComment(id: $id) {
        id
        content
        contentExcerpt
        deleted
      }
    }
  `

  describe('given a post and a comment', () => {
    beforeEach(setupPostAndComment)

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        const result = await mutate({ mutation: deleteCommentMutation, variables })
        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated but not the author', () => {
      beforeEach(async () => {
        const randomGuy = await factory.create('User')
        authenticatedUser = await randomGuy.toJson()
      })

      it('throws authorization error', async () => {
        const { errors } = await mutate({ mutation: deleteCommentMutation, variables })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated as author', () => {
      beforeEach(async () => {
        authenticatedUser = await commentAuthor.toJson()
      })

      it('marks the comment as deleted and blacks out content', async () => {
        const { data } = await mutate({ mutation: deleteCommentMutation, variables })
        const expected = {
          DeleteComment: {
            id: 'c456',
            deleted: true,
            content: 'UNAVAILABLE',
            contentExcerpt: 'UNAVAILABLE',
          },
        }
        expect(data).toMatchObject(expected)
      })
    })
  })
})
