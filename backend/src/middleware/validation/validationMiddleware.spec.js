import { gql } from '../../helpers/jest'
import Factory from '../../seed/factories'
import { getNeode, getDriver } from '../../bootstrap/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()
let authenticatedUser,
  mutate,
  users,
  offensivePost,
  reportVariables,
  disableVariables,
  reportingUser,
  moderatingUser,
  commentingUser

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
  mutation($id: ID, $title: String!, $content: String!, $language: String, $categoryIds: [ID]) {
    CreatePost(
      id: $id
      title: $title
      content: $content
      language: $language
      categoryIds: $categoryIds
    ) {
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
const reportMutation = gql`
  mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
    fileReport(
      resourceId: $resourceId
      reasonCategory: $reasonCategory
      reasonDescription: $reasonDescription
    ) {
      id
    }
  }
`
const reviewMutation = gql`
  mutation($resourceId: ID!, $disable: Boolean, $closed: Boolean) {
    review(resourceId: $resourceId, disable: $disable, closed: $closed) {
      createdAt
      updatedAt
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
  users = await Promise.all([
    factory.create('User', {
      id: 'reporting-user',
    }),
    factory.create('User', {
      id: 'moderating-user',
      role: 'moderator',
    }),
    factory.create('User', {
      id: 'commenting-user',
    }),
  ])
  reportVariables = {
    resourceId: 'whatever',
    reasonCategory: 'other',
    reasonDescription: 'Violates code of conduct !!!',
  }
  disableVariables = {
    resourceId: 'undefined-resource',
    disable: true,
    closed: false,
  }
  reportingUser = users[0]
  moderatingUser = users[1]
  commentingUser = users[2]
  const posts = await Promise.all([
    factory.create('Post', {
      id: 'offensive-post',
      authorId: 'moderating-user',
    }),
    factory.create('Post', {
      id: 'post-4-commenting',
      authorId: 'commenting-user',
    }),
  ])
  offensivePost = posts[0]
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
    authenticatedUser = await commentingUser.toJson()
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
        authorId: 'commenting-user',
      })
      updateCommentVariables = {
        id: 'whatever',
        content: '',
      }
      authenticatedUser = await commentingUser.toJson()
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
      authenticatedUser = await commentingUser.toJson()
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

describe('validateReport', () => {
  it('throws an error if a user tries to report themself', async () => {
    authenticatedUser = await reportingUser.toJson()
    reportVariables = { ...reportVariables, resourceId: 'reporting-user' }
    await expect(
      mutate({ mutation: reportMutation, variables: reportVariables }),
    ).resolves.toMatchObject({
      data: { fileReport: null },
      errors: [{ message: 'You cannot report yourself!' }],
    })
  })
})

describe('validateReview', () => {
  beforeEach(async () => {
    const reportAgainstModerator = await factory.create('Report')
    await Promise.all([
      reportAgainstModerator.relateTo(reportingUser, 'filed', {
        ...reportVariables,
        resourceId: 'moderating-user',
      }),
      reportAgainstModerator.relateTo(moderatingUser, 'belongsTo'),
    ])
    authenticatedUser = await moderatingUser.toJson()
  })

  it('throws an error if a user tries to review a report against them', async () => {
    disableVariables = { ...disableVariables, resourceId: 'moderating-user' }
    await expect(
      mutate({ mutation: reviewMutation, variables: disableVariables }),
    ).resolves.toMatchObject({
      data: { review: null },
      errors: [{ message: 'You cannot review yourself!' }],
    })
  })

  it('throws an error for invaild resource', async () => {
    disableVariables = { ...disableVariables, resourceId: 'non-existent-resource' }
    await expect(
      mutate({ mutation: reviewMutation, variables: disableVariables }),
    ).resolves.toMatchObject({
      data: { review: null },
      errors: [{ message: 'Resource not found or is not a Post|Comment|User!' }],
    })
  })

  it('throws an error if no report exists', async () => {
    disableVariables = { ...disableVariables, resourceId: 'offensive-post' }
    await expect(
      mutate({ mutation: reviewMutation, variables: disableVariables }),
    ).resolves.toMatchObject({
      data: { review: null },
      errors: [{ message: 'Before starting the review process, please report the Post!' }],
    })
  })

  it('throws an error if a moderator tries to review their own resource(Post|Comment)', async () => {
    const reportAgainstOffensivePost = await factory.create('Report')
    await Promise.all([
      reportAgainstOffensivePost.relateTo(reportingUser, 'filed', {
        ...reportVariables,
        resourceId: 'offensive-post',
      }),
      reportAgainstOffensivePost.relateTo(offensivePost, 'belongsTo'),
    ])
    disableVariables = { ...disableVariables, resourceId: 'offensive-post' }
    await expect(
      mutate({ mutation: reviewMutation, variables: disableVariables }),
    ).resolves.toMatchObject({
      data: { review: null },
      errors: [{ message: 'You cannot review your own Post!' }],
    })
  })

  describe('moderate a resource that is not a (Comment|Post|User) ', () => {
    beforeEach(async () => {
      await Promise.all([factory.create('Tag', { id: 'tag-id' })])
    })

    it('returns null', async () => {
      disableVariables = {
        ...disableVariables,
        resourceId: 'tag-id',
      }
      await expect(
        mutate({ mutation: reviewMutation, variables: disableVariables }),
      ).resolves.toMatchObject({
        data: { review: null },
        errors: [{ message: 'Resource not found or is not a Post|Comment|User!' }],
      })
    })
  })
})
