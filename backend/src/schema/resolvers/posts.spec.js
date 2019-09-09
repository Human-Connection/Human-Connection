import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

const driver = getDriver()
const factory = Factory()
const neode = getNeode()

let query
let mutate
let authenticatedUser
let user

const categoryIds = ['cat9', 'cat4', 'cat15']
let variables

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
      title
      content
      slug
      disabled
      deleted
      language
      author {
        name
      }
    }
  }
`

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      return {
        driver,
        neode,
        user: authenticatedUser,
      }
    },
  })
  query = createTestClient(server).query
  mutate = createTestClient(server).mutate
})

beforeEach(async () => {
  variables = {}
  user = await factory.create('User', {
    id: 'u198',
    name: 'TestUser',
    email: 'test@example.org',
    password: '1234',
  })
  await Promise.all([
    neode.create('Category', {
      id: 'cat9',
      name: 'Democracy & Politics',
      icon: 'university',
    }),
    neode.create('Category', {
      id: 'cat4',
      name: 'Environment & Nature',
      icon: 'tree',
    }),
    neode.create('Category', {
      id: 'cat15',
      name: 'Consumption & Sustainability',
      icon: 'shopping-cart',
    }),
    neode.create('Category', {
      id: 'cat27',
      name: 'Animal Protection',
      icon: 'paw',
    }),
  ])
  authenticatedUser = null
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('Post', () => {
  const postQueryFilteredByCategories = gql`
    query Post($filter: _PostFilter) {
      Post(filter: $filter) {
        id
        categories {
          id
        }
      }
    }
  `

  const postQueryFilteredByEmotions = gql`
    query Post($filter: _PostFilter) {
      Post(filter: $filter) {
        id
        emotions {
          emotion
        }
      }
    }
  `

  describe('can be filtered', () => {
    let post31, post32
    beforeEach(async () => {
      ;[post31, post32] = await Promise.all([
        factory.create('Post', { id: 'p31', categoryIds: ['cat4'] }),
        factory.create('Post', { id: 'p32', categoryIds: ['cat15'] }),
        factory.create('Post', { id: 'p33', categoryIds: ['cat9'] }),
      ])
    })

    it('by categories', async () => {
      const expected = {
        data: {
          Post: [
            {
              id: 'p33',
              categories: [{ id: 'cat9' }],
            },
          ],
        },
      }
      variables = { ...variables, filter: { categories_some: { id_in: ['cat9'] } } }
      await expect(
        query({ query: postQueryFilteredByCategories, variables }),
      ).resolves.toMatchObject(expected)
    })

    it('by emotions', async () => {
      const expected = {
        data: {
          Post: [
            {
              id: 'p31',
              emotions: [{ emotion: 'happy' }],
            },
          ],
        },
      }
      await user.relateTo(post31, 'emoted', { emotion: 'happy' })
      variables = { ...variables, filter: { emotions_some: { emotion_in: ['happy'] } } }
      await expect(query({ query: postQueryFilteredByEmotions, variables })).resolves.toMatchObject(
        expected,
      )
    })

    it('supports filtering by multiple emotions', async () => {
      const expected = [
        {
          id: 'p31',
          emotions: [{ emotion: 'happy' }],
        },
        {
          id: 'p32',
          emotions: [{ emotion: 'cry' }],
        },
      ]
      await user.relateTo(post31, 'emoted', { emotion: 'happy' })
      await user.relateTo(post32, 'emoted', { emotion: 'cry' })
      variables = { ...variables, filter: { emotions_some: { emotion_in: ['happy', 'cry'] } } }
      await expect(query({ query: postQueryFilteredByEmotions, variables })).resolves.toMatchObject(
        {
          data: {
            Post: expect.arrayContaining(expected),
          },
        },
      )
    })
  })
})

describe('CreatePost', () => {
  beforeEach(() => {
    variables = {
      ...variables,
      id: 'p3589',
      title: 'I am a title',
      content: 'Some content',
      categoryIds,
    }
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation: createPostMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    it('creates a post', async () => {
      const expected = { data: { CreatePost: { title: 'I am a title', content: 'Some content' } } }
      await expect(mutate({ mutation: createPostMutation, variables })).resolves.toMatchObject(
        expected,
      )
    })

    it('assigns the authenticated user as author', async () => {
      const expected = {
        data: {
          CreatePost: {
            title: 'I am a title',
            author: {
              name: 'TestUser',
            },
          },
        },
      }
      await expect(mutate({ mutation: createPostMutation, variables })).resolves.toMatchObject(
        expected,
      )
    })

    it('`disabled` and `deleted` default to `false`', async () => {
      const expected = { data: { CreatePost: { disabled: false, deleted: false } } }
      await expect(mutate({ mutation: createPostMutation, variables })).resolves.toMatchObject(
        expected,
      )
    })

    describe('language', () => {
      beforeEach(() => {
        variables = { ...variables, language: 'es' }
      })

      it('allows a user to set the language of the post', async () => {
        const expected = { data: { CreatePost: { language: 'es' } } }
        await expect(mutate({ mutation: createPostMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })
    })

    describe('categories', () => {
      describe('null', () => {
        beforeEach(() => {
          variables = { ...variables, categoryIds: null }
        })
        it('throws UserInputError', async () => {
          const {
            errors: [error],
          } = await mutate({ mutation: createPostMutation, variables })
          expect(error).toHaveProperty(
            'message',
            'You cannot save a post without at least one category or more than three',
          )
        })
      })

      describe('empty', () => {
        beforeEach(() => {
          variables = { ...variables, categoryIds: [] }
        })
        it('throws UserInputError', async () => {
          const {
            errors: [error],
          } = await mutate({ mutation: createPostMutation, variables })
          expect(error).toHaveProperty(
            'message',
            'You cannot save a post without at least one category or more than three',
          )
        })
      })

      describe('more than 3 items', () => {
        beforeEach(() => {
          variables = { ...variables, categoryIds: ['cat9', 'cat27', 'cat15', 'cat4'] }
        })
        it('throws UserInputError', async () => {
          const {
            errors: [error],
          } = await mutate({ mutation: createPostMutation, variables })
          expect(error).toHaveProperty(
            'message',
            'You cannot save a post without at least one category or more than three',
          )
        })
      })
    })
  })
})

describe('UpdatePost', () => {
  let author
  const updatePostMutation = gql`
    mutation($id: ID!, $title: String!, $content: String!, $categoryIds: [ID]) {
      UpdatePost(id: $id, title: $title, content: $content, categoryIds: $categoryIds) {
        id
        content
        categories {
          id
        }
      }
    }
  `
  beforeEach(async () => {
    author = await factory.create('User', { slug: 'the-author' })
    await factory.create('Post', {
      author,
      id: 'p9876',
      title: 'Old title',
      content: 'Old content',
      categoryIds,
    })

    variables = {
      ...variables,
      id: 'p9876',
      title: 'New title',
      content: 'New content',
    }
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation: updatePostMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated but not the author', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation: updatePostMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated as author', () => {
    beforeEach(async () => {
      authenticatedUser = await author.toJson()
    })

    it('updates a post', async () => {
      const expected = { data: { UpdatePost: { id: 'p9876', content: 'New content' } } }
      await expect(mutate({ mutation: updatePostMutation, variables })).resolves.toMatchObject(
        expected,
      )
    })

    describe('no new category ids provided for update', () => {
      it('resolves and keeps current categories', async () => {
        const expected = {
          data: {
            UpdatePost: {
              id: 'p9876',
              categories: expect.arrayContaining([{ id: 'cat9' }, { id: 'cat4' }, { id: 'cat15' }]),
            },
          },
        }
        await expect(mutate({ mutation: updatePostMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })
    })

    describe('given category ids', () => {
      beforeEach(() => {
        variables = { ...variables, categoryIds: ['cat27'] }
      })

      it('updates categories of a post', async () => {
        const expected = {
          data: {
            UpdatePost: {
              id: 'p9876',
              categories: expect.arrayContaining([{ id: 'cat27' }]),
            },
          },
        }
        await expect(mutate({ mutation: updatePostMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })

      describe('more than 3 categories', () => {
        beforeEach(() => {
          variables = { ...variables, categoryIds: ['cat9', 'cat27', 'cat15', 'cat4'] }
        })

        it('allows a maximum of three category for a successful update', async () => {
          const {
            errors: [error],
          } = await mutate({ mutation: updatePostMutation, variables })
          expect(error).toHaveProperty(
            'message',
            'You cannot save a post without at least one category or more than three',
          )
        })
      })

      describe('post created without categories somehow', () => {
        let owner

        beforeEach(async () => {
          const postSomehowCreated = await neode.create('Post', {
            id: 'how-was-this-created',
          })
          owner = await neode.create('User', {
            id: 'author-of-post-without-category',
            name: 'Hacker',
            slug: 'hacker',
            email: 'hacker@example.org',
            password: '1234',
          })
          await postSomehowCreated.relateTo(owner, 'author')
          authenticatedUser = await owner.toJson()
          variables = { ...variables, id: 'how-was-this-created' }
        })

        it('throws an error if categoryIds is not an array', async () => {
          const {
            errors: [error],
          } = await mutate({
            mutation: updatePostMutation,
            variables: {
              ...variables,
              categoryIds: null,
            },
          })
          expect(error).toHaveProperty(
            'message',
            'You cannot save a post without at least one category or more than three',
          )
        })

        it('requires at least one category for successful update', async () => {
          const {
            errors: [error],
          } = await mutate({
            mutation: updatePostMutation,
            variables: {
              ...variables,
              categoryIds: [],
            },
          })
          expect(error).toHaveProperty(
            'message',
            'You cannot save a post without at least one category or more than three',
          )
        })
      })
    })
  })
})

describe('DeletePost', () => {
  let author
  const deletePostMutation = gql`
    mutation($id: ID!) {
      DeletePost(id: $id) {
        id
        deleted
        content
        contentExcerpt
        image
        comments {
          deleted
          content
          contentExcerpt
        }
      }
    }
  `

  beforeEach(async () => {
    author = await factory.create('User')
    await factory.create('Post', {
      id: 'p4711',
      author,
      title: 'I will be deleted',
      content: 'To be deleted',
      image: 'path/to/some/image',
      categoryIds,
    })
    variables = { ...variables, id: 'p4711' }
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation: deletePostMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated but not the author', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation: deletePostMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated as author', () => {
    beforeEach(async () => {
      authenticatedUser = await author.toJson()
    })

    it('marks the post as deleted and blacks out attributes', async () => {
      const expected = {
        data: {
          DeletePost: {
            id: 'p4711',
            deleted: true,
            content: 'UNAVAILABLE',
            contentExcerpt: 'UNAVAILABLE',
            image: null,
            comments: [],
          },
        },
      }
      await expect(mutate({ mutation: deletePostMutation, variables })).resolves.toMatchObject(
        expected,
      )
    })

    describe('if there are comments on the post', () => {
      beforeEach(async () => {
        await factory.create('Comment', {
          postId: 'p4711',
          content: 'to be deleted comment content',
          contentExcerpt: 'to be deleted comment content',
        })
      })

      it('marks the comments as deleted', async () => {
        const expected = {
          data: {
            DeletePost: {
              id: 'p4711',
              deleted: true,
              content: 'UNAVAILABLE',
              contentExcerpt: 'UNAVAILABLE',
              image: null,
              comments: [
                {
                  deleted: true,
                  // Should we black out the comment content in the database, too?
                  content: 'UNAVAILABLE',
                  contentExcerpt: 'UNAVAILABLE',
                },
              ],
            },
          },
        }
        await expect(mutate({ mutation: deletePostMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })
    })
  })
})

describe('emotions', () => {
  let author, postToEmote
  const PostsEmotionsCountQuery = gql`
    query($id: ID!) {
      Post(id: $id) {
        emotionsCount
      }
    }
  `
  const PostsEmotionsQuery = gql`
    query($id: ID!) {
      Post(id: $id) {
        emotions {
          emotion
          User {
            id
          }
        }
      }
    }
  `

  beforeEach(async () => {
    author = await neode.create('User', { id: 'u257' })
    postToEmote = await factory.create('Post', {
      author,
      id: 'p1376',
      categoryIds,
    })

    variables = {
      ...variables,
      to: { id: 'p1376' },
      data: { emotion: 'happy' },
    }
  })

  describe('AddPostEmotions', () => {
    const addPostEmotionsMutation = gql`
      mutation($to: _PostInput!, $data: _EMOTEDInput!) {
        AddPostEmotions(to: $to, data: $data) {
          from {
            id
          }
          to {
            id
          }
          emotion
        }
      }
    `
    let postsEmotionsQueryVariables

    beforeEach(async () => {
      postsEmotionsQueryVariables = { id: 'p1376' }
    })

    describe('unauthenticated', () => {
      beforeEach(() => {
        authenticatedUser = null
      })

      it('throws authorization error', async () => {
        const addPostEmotions = await mutate({
          mutation: addPostEmotionsMutation,
          variables,
        })

        expect(addPostEmotions.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated and not the author', () => {
      beforeEach(async () => {
        authenticatedUser = await user.toJson()
      })

      it('adds an emotion to the post', async () => {
        const expected = {
          data: {
            AddPostEmotions: {
              from: { id: 'u198' },
              to: { id: 'p1376' },
              emotion: 'happy',
            },
          },
        }
        await expect(mutate({ mutation: addPostEmotionsMutation, variables })).resolves.toEqual(
          expect.objectContaining(expected),
        )
      })

      it('limits the addition of the same emotion to 1', async () => {
        const expected = {
          data: {
            Post: [
              {
                emotionsCount: 1,
              },
            ],
          },
        }
        await mutate({ mutation: addPostEmotionsMutation, variables })
        await mutate({ mutation: addPostEmotionsMutation, variables })
        await expect(
          query({ query: PostsEmotionsCountQuery, variables: postsEmotionsQueryVariables }),
        ).resolves.toEqual(expect.objectContaining(expected))
      })

      it('allows a user to add more than one emotion', async () => {
        const expected = {
          data: {
            Post: [
              {
                emotions: expect.arrayContaining([
                  { emotion: 'happy', User: { id: 'u198' } },
                  { emotion: 'surprised', User: { id: 'u198' } },
                ]),
              },
            ],
          },
        }
        await mutate({ mutation: addPostEmotionsMutation, variables })
        variables = { ...variables, data: { emotion: 'surprised' } }
        await mutate({ mutation: addPostEmotionsMutation, variables })
        await expect(
          query({ query: PostsEmotionsQuery, variables: postsEmotionsQueryVariables }),
        ).resolves.toEqual(expect.objectContaining(expected))
      })
    })

    describe('authenticated as author', () => {
      beforeEach(async () => {
        authenticatedUser = await author.toJson()
      })

      it('adds an emotion to the post', async () => {
        const expected = {
          data: {
            AddPostEmotions: {
              from: { id: 'u257' },
              to: { id: 'p1376' },
              emotion: 'happy',
            },
          },
        }
        await expect(mutate({ mutation: addPostEmotionsMutation, variables })).resolves.toEqual(
          expect.objectContaining(expected),
        )
      })
    })
  })

  describe('RemovePostEmotions', () => {
    let removePostEmotionsVariables, postsEmotionsQueryVariables
    const removePostEmotionsMutation = gql`
      mutation($to: _PostInput!, $data: _EMOTEDInput!) {
        RemovePostEmotions(to: $to, data: $data) {
          from {
            id
          }
          to {
            id
          }
          emotion
        }
      }
    `
    beforeEach(async () => {
      await author.relateTo(postToEmote, 'emoted', { emotion: 'happy' })
      await user.relateTo(postToEmote, 'emoted', { emotion: 'cry' })

      postsEmotionsQueryVariables = { id: 'p1376' }
      removePostEmotionsVariables = {
        to: { id: 'p1376' },
        data: { emotion: 'cry' },
      }
    })

    describe('unauthenticated', () => {
      beforeEach(() => {
        authenticatedUser = null
      })

      it('throws authorization error', async () => {
        const removePostEmotions = await mutate({
          mutation: removePostEmotionsMutation,
          variables: removePostEmotionsVariables,
        })
        expect(removePostEmotions.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated', () => {
      describe('but not the emoter', () => {
        beforeEach(async () => {
          authenticatedUser = await author.toJson()
        })

        it('returns null if the emotion could not be found', async () => {
          const removePostEmotions = await mutate({
            mutation: removePostEmotionsMutation,
            variables: removePostEmotionsVariables,
          })
          expect(removePostEmotions).toEqual(
            expect.objectContaining({ data: { RemovePostEmotions: null } }),
          )
        })
      })

      describe('as the emoter', () => {
        beforeEach(async () => {
          authenticatedUser = await user.toJson()
        })

        it('removes an emotion from a post', async () => {
          const expected = {
            data: {
              RemovePostEmotions: {
                to: { id: 'p1376' },
                from: { id: 'u198' },
                emotion: 'cry',
              },
            },
          }
          await expect(
            mutate({
              mutation: removePostEmotionsMutation,
              variables: removePostEmotionsVariables,
            }),
          ).resolves.toEqual(expect.objectContaining(expected))
        })

        it('removes only the requested emotion, not all emotions', async () => {
          const expectedEmotions = [{ emotion: 'happy', User: { id: 'u257' } }]
          const expectedResponse = {
            data: { Post: [{ emotions: expect.arrayContaining(expectedEmotions) }] },
          }
          await mutate({
            mutation: removePostEmotionsMutation,
            variables: removePostEmotionsVariables,
          })
          await expect(
            query({ query: PostsEmotionsQuery, variables: postsEmotionsQueryVariables }),
          ).resolves.toEqual(expect.objectContaining(expectedResponse))
        })
      })
    })
  })

  describe('posts emotions count', () => {
    let PostsEmotionsCountByEmotionVariables
    let PostsEmotionsByCurrentUserVariables

    const PostsEmotionsCountByEmotionQuery = gql`
      query($postId: ID!, $data: _EMOTEDInput!) {
        PostsEmotionsCountByEmotion(postId: $postId, data: $data)
      }
    `

    const PostsEmotionsByCurrentUserQuery = gql`
      query($postId: ID!) {
        PostsEmotionsByCurrentUser(postId: $postId)
      }
    `
    beforeEach(async () => {
      await user.relateTo(postToEmote, 'emoted', { emotion: 'cry' })

      PostsEmotionsCountByEmotionVariables = {
        postId: 'p1376',
        data: { emotion: 'cry' },
      }
      PostsEmotionsByCurrentUserVariables = { postId: 'p1376' }
    })

    describe('PostsEmotionsCountByEmotion', () => {
      it("returns a post's emotions count", async () => {
        const expectedResponse = { data: { PostsEmotionsCountByEmotion: 1 } }
        await expect(
          query({
            query: PostsEmotionsCountByEmotionQuery,
            variables: PostsEmotionsCountByEmotionVariables,
          }),
        ).resolves.toEqual(expect.objectContaining(expectedResponse))
      })
    })

    describe('PostsEmotionsByCurrentUser', () => {
      describe('authenticated', () => {
        beforeEach(async () => {
          authenticatedUser = await user.toJson()
        })

        it("returns a currentUser's emotions on a post", async () => {
          const expectedResponse = { data: { PostsEmotionsByCurrentUser: ['cry'] } }
          await expect(
            query({
              query: PostsEmotionsByCurrentUserQuery,
              variables: PostsEmotionsByCurrentUserVariables,
            }),
          ).resolves.toEqual(expect.objectContaining(expectedResponse))
        })
      })
    })
  })
})
