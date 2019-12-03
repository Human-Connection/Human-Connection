import { gql } from '../../helpers/jest'
import Factory from '../../seed/factories'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()
let mutate, authenticatedUser, user
const createCommentMutation = gql`
  mutation($id: ID, $postId: ID!, $content: String!) {
    CreateComment(id: $id, postId: $postId, content: $content) {
      id
    }
  }
`
const updateCommentMutation = gql`
  mutation($content: String!, $id: ID!) {
    UpdateComment(content: $content, id: $id) {
      id
    }
  }
`
const createPostMutation = gql`
  mutation($id: ID, $title: String!, $content: String!, $categoryIds: [ID]) {
    CreatePost(id: $id, title: $title, content: $content, categoryIds: $categoryIds) {
      id
    }
  }
`

const updatePostMutation = gql`
  mutation($id: ID!, $title: String!, $content: String!, $categoryIds: [ID]) {
    UpdatePost(id: $id, title: $title, content: $content, categoryIds: $categoryIds) {
      id
    }
  }
`

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      return {
        user: authenticatedUser,
        neode,
        driver,
      }
    },
  })
  mutate = createTestClient(server).mutate
})

beforeEach(async () => {
  user = await factory.create('User', {
    id: 'user-id',
  })
  await factory.create('Post', {
    id: 'post-4-commenting',
    authorId: 'user-id',
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('validateCreateComment', () => {
  let createCommentVariables
  beforeEach(async () => {
    createCommentVariables = {
      postId: 'whatever',
      content: '',
    }
    authenticatedUser = await user.toJson()
  })

  it('throws an error if content is empty', async () => {
    createCommentVariables = { ...createCommentVariables, postId: 'post-4-commenting' }
    await expect(
      mutate({ mutation: createCommentMutation, variables: createCommentVariables }),
    ).resolves.toMatchObject({
      data: { CreateComment: null },
      errors: [{ message: 'Comment must be at least 1 character long!' }],
    })
  })

  it('sanitizes content and throws an error if not longer than 1 character', async () => {
    createCommentVariables = { postId: 'post-4-commenting', content: '<a></a>' }
    await expect(
      mutate({ mutation: createCommentMutation, variables: createCommentVariables }),
    ).resolves.toMatchObject({
      data: { CreateComment: null },
      errors: [{ message: 'Comment must be at least 1 character long!' }],
    })
  })

  it('throws an error if there is no post with given id in the database', async () => {
    createCommentVariables = {
      ...createCommentVariables,
      postId: 'non-existent-post',
      content: 'valid content',
    }
    await expect(
      mutate({ mutation: createCommentMutation, variables: createCommentVariables }),
    ).resolves.toMatchObject({
      data: { CreateComment: null },
      errors: [{ message: 'Comment cannot be created without a post!' }],
    })
  })

  describe('validateUpdateComment', () => {
    let updateCommentVariables
    beforeEach(async () => {
      await factory.create('Comment', {
        id: 'comment-id',
        authorId: 'user-id',
      })
      updateCommentVariables = {
        id: 'whatever',
        content: '',
      }
      authenticatedUser = await user.toJson()
    })

    it('throws an error if content is empty', async () => {
      updateCommentVariables = { ...updateCommentVariables, id: 'comment-id' }
      await expect(
        mutate({ mutation: updateCommentMutation, variables: updateCommentVariables }),
      ).resolves.toMatchObject({
        data: { UpdateComment: null },
        errors: [{ message: 'Comment must be at least 1 character long!' }],
      })
    })

    it('sanitizes content and throws an error if not longer than 1 character', async () => {
      updateCommentVariables = { id: 'comment-id', content: '<a></a>' }
      await expect(
        mutate({ mutation: updateCommentMutation, variables: updateCommentVariables }),
      ).resolves.toMatchObject({
        data: { UpdateComment: null },
        errors: [{ message: 'Comment must be at least 1 character long!' }],
      })
    })
  })

  describe('validatePost', () => {
    let createPostVariables
    beforeEach(async () => {
      createPostVariables = {
        title: 'I am  a title',
        content: 'Some content',
      }
      authenticatedUser = await user.toJson()
    })

    describe('categories', () => {
      describe('null', () => {
        it('throws UserInputError', async () => {
          createPostVariables = { ...createPostVariables, categoryIds: null }
          await expect(
            mutate({ mutation: createPostMutation, variables: createPostVariables }),
          ).resolves.toMatchObject({
            data: { CreatePost: null },
            errors: [
              {
                message: 'You cannot save a post without at least one category or more than three',
              },
            ],
          })
        })
      })

      describe('empty', () => {
        it('throws UserInputError', async () => {
          createPostVariables = { ...createPostVariables, categoryIds: [] }
          await expect(
            mutate({ mutation: createPostMutation, variables: createPostVariables }),
          ).resolves.toMatchObject({
            data: { CreatePost: null },
            errors: [
              {
                message: 'You cannot save a post without at least one category or more than three',
              },
            ],
          })
        })
      })

      describe('more than 3 categoryIds', () => {
        it('throws UserInputError', async () => {
          createPostVariables = {
            ...createPostVariables,
            categoryIds: ['cat9', 'cat27', 'cat15', 'cat4'],
          }
          await expect(
            mutate({ mutation: createPostMutation, variables: createPostVariables }),
          ).resolves.toMatchObject({
            data: { CreatePost: null },
            errors: [
              {
                message: 'You cannot save a post without at least one category or more than three',
              },
            ],
          })
        })
      })
    })
  })

  describe('validateUpdatePost', () => {
    describe('post created without categories somehow', () => {
      let owner, updatePostVariables
      beforeEach(async () => {
        const postSomehowCreated = await neode.create('Post', {
          id: 'how-was-this-created',
        })
        owner = await neode.create('User', {
          id: 'author-of-post-without-category',
          slug: 'hacker',
        })
        await postSomehowCreated.relateTo(owner, 'author')
        authenticatedUser = await owner.toJson()
        updatePostVariables = {
          id: 'how-was-this-created',
          title: 'I am  a title',
          content: 'Some content',
          categoryIds: [],
        }
      })

      it('requires at least one category for successful update', async () => {
        await expect(
          mutate({ mutation: updatePostMutation, variables: updatePostVariables }),
        ).resolves.toMatchObject({
          data: { UpdatePost: null },
          errors: [
            { message: 'You cannot save a post without at least one category or more than three' },
          ],
        })
      })
    })
  })
})
