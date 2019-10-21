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

beforeAll(async () => {
  await factory.cleanDatabase()
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
    id: 'current-user',
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
  describe('can be filtered', () => {
    let followedUser, happyPost, cryPost
    beforeEach(async () => {
      ;[followedUser] = await Promise.all([
        factory.create('User', {
          id: 'followed-by-me',
          email: 'followed@example.org',
          name: 'Followed User',
          password: '1234',
        }),
      ])
      ;[happyPost, cryPost] = await Promise.all([
        factory.create('Post', { id: 'happy-post', categoryIds: ['cat4'] }),
        factory.create('Post', { id: 'cry-post', categoryIds: ['cat15'] }),
        factory.create('Post', {
          id: 'post-by-followed-user',
          categoryIds: ['cat9'],
          author: followedUser,
        }),
      ])
    })

    describe('no filter', () => {
      it('returns all posts', async () => {
        const postQueryNoFilters = gql`
          query Post($filter: _PostFilter) {
            Post(filter: $filter) {
              id
            }
          }
        `
        const expected = [{ id: 'happy-post' }, { id: 'cry-post' }, { id: 'post-by-followed-user' }]
        variables = { filter: {} }
        await expect(query({ query: postQueryNoFilters, variables })).resolves.toMatchObject({
          data: {
            Post: expect.arrayContaining(expected),
          },
        })
      })
    })

    it('by categories', async () => {
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
      const expected = {
        data: {
          Post: [
            {
              id: 'post-by-followed-user',
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

    describe('by emotions', () => {
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

      it('filters by single emotion', async () => {
        const expected = {
          data: {
            Post: [
              {
                id: 'happy-post',
                emotions: [{ emotion: 'happy' }],
              },
            ],
          },
        }
        await user.relateTo(happyPost, 'emoted', { emotion: 'happy' })
        variables = { ...variables, filter: { emotions_some: { emotion_in: ['happy'] } } }
        await expect(
          query({ query: postQueryFilteredByEmotions, variables }),
        ).resolves.toMatchObject(expected)
      })

      it('filters by multiple emotions', async () => {
        const expected = [
          {
            id: 'happy-post',
            emotions: [{ emotion: 'happy' }],
          },
          {
            id: 'cry-post',
            emotions: [{ emotion: 'cry' }],
          },
        ]
        await user.relateTo(happyPost, 'emoted', { emotion: 'happy' })
        await user.relateTo(cryPost, 'emoted', { emotion: 'cry' })
        variables = { ...variables, filter: { emotions_some: { emotion_in: ['happy', 'cry'] } } }
        await expect(
          query({ query: postQueryFilteredByEmotions, variables }),
        ).resolves.toMatchObject({
          data: {
            Post: expect.arrayContaining(expected),
          },
        })
      })
    })

    it('by followed-by', async () => {
      const postQueryFilteredByUsersFollowed = gql`
        query Post($filter: _PostFilter) {
          Post(filter: $filter) {
            id
            author {
              id
              name
            }
          }
        }
      `

      await user.relateTo(followedUser, 'following')
      variables = { filter: { author: { followedBy_some: { id: 'current-user' } } } }
      const expected = {
        data: {
          Post: [
            {
              id: 'post-by-followed-user',
              author: { id: 'followed-by-me', name: 'Followed User' },
            },
          ],
        },
      }
      await expect(
        query({ query: postQueryFilteredByUsersFollowed, variables }),
      ).resolves.toMatchObject(expected)
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
      const expected = {
        data: { CreatePost: { title: 'I am a title', content: 'Some content' } },
        errors: undefined,
      }
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
        errors: undefined,
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
  let author, newlyCreatedPost
  const updatePostMutation = gql`
    mutation($id: ID!, $title: String!, $content: String!, $categoryIds: [ID]) {
      UpdatePost(id: $id, title: $title, content: $content, categoryIds: $categoryIds) {
        id
        title
        content
        author {
          name
          slug
        }
        categories {
          id
        }
        createdAt
        updatedAt
      }
    }
  `
  beforeEach(async () => {
    author = await factory.create('User', { slug: 'the-author' })
    newlyCreatedPost = await factory.create('Post', {
      author,
      id: 'p9876',
      title: 'Old title',
      content: 'Old content',
      categoryIds,
    })

    variables = {
      id: 'p9876',
      title: 'New title',
      content: 'New content',
    }
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      authenticatedUser = null
      expect(mutate({ mutation: updatePostMutation, variables })).resolves.toMatchObject({
        errors: [{ message: 'Not Authorised!' }],
        data: { UpdatePost: null },
      })
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

    it('updates a post, but maintains non-updated attributes', async () => {
      const expected = {
        data: {
          UpdatePost: { id: 'p9876', content: 'New content', createdAt: expect.any(String) },
        },
      }
      await expect(mutate({ mutation: updatePostMutation, variables })).resolves.toMatchObject(
        expected,
      )
    })

    it('updates the updatedAt attribute', async () => {
      newlyCreatedPost = await newlyCreatedPost.toJson()
      const {
        data: { UpdatePost },
      } = await mutate({ mutation: updatePostMutation, variables })
      expect(newlyCreatedPost.updatedAt).toBeTruthy()
      expect(Date.parse(newlyCreatedPost.updatedAt)).toEqual(expect.any(Number))
      expect(UpdatePost.updatedAt).toBeTruthy()
      expect(Date.parse(UpdatePost.updatedAt)).toEqual(expect.any(Number))
      expect(newlyCreatedPost.updatedAt).not.toEqual(UpdatePost.updatedAt)
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

  describe('pin posts', () => {
    const pinPostMutation = gql`
      mutation($id: ID!) {
        pinPost(id: $id) {
          id
          title
          content
          author {
            name
            slug
          }
          pinnedBy {
            id
            name
            role
          }
          createdAt
          updatedAt
          pinnedAt
        }
      }
    `
    beforeEach(async () => {
      variables = { ...variables }
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = null
        await expect(mutate({ mutation: pinPostMutation, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
          data: { pinPost: null },
        })
      })
    })

    describe('users cannot pin posts', () => {
      it('throws authorization error', async () => {
        await expect(mutate({ mutation: pinPostMutation, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
          data: { pinPost: null },
        })
      })
    })

    describe('moderators cannot pin posts', () => {
      let moderator
      beforeEach(async () => {
        moderator = await user.update({ role: 'moderator', updatedAt: new Date().toISOString() })
        authenticatedUser = await moderator.toJson()
      })

      it('throws authorization error', async () => {
        await expect(mutate({ mutation: pinPostMutation, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
          data: { pinPost: null },
        })
      })
    })

    describe('admin can pin posts', () => {
      let admin
      beforeEach(async () => {
        admin = await user.update({
          role: 'admin',
          name: 'Admin',
          updatedAt: new Date().toISOString(),
        })
        authenticatedUser = await admin.toJson()
      })

      describe('post created by them', () => {
        beforeEach(async () => {
          await factory.create('Post', {
            id: 'created-and-pinned-by-same-admin',
            author: admin,
          })
        })

        it('responds with the updated Post', async () => {
          variables = { ...variables, id: 'created-and-pinned-by-same-admin' }
          const expected = {
            data: {
              pinPost: {
                id: 'created-and-pinned-by-same-admin',
                author: {
                  name: 'Admin',
                },
                pinnedBy: {
                  id: 'current-user',
                  name: 'Admin',
                  role: 'admin',
                },
              },
            },
            errors: undefined,
          }

          await expect(mutate({ mutation: pinPostMutation, variables })).resolves.toMatchObject(
            expected,
          )
        })

        it('sets createdAt date for PINNED', async () => {
          variables = { ...variables, id: 'created-and-pinned-by-same-admin' }
          const expected = {
            data: {
              pinPost: {
                id: 'created-and-pinned-by-same-admin',
                pinnedAt: expect.any(String),
              },
            },
            errors: undefined,
          }
          await expect(mutate({ mutation: pinPostMutation, variables })).resolves.toMatchObject(
            expected,
          )
        })
      })

      describe('post created by another admin', () => {
        let otherAdmin
        beforeEach(async () => {
          otherAdmin = await factory.create('User', {
            role: 'admin',
            name: 'otherAdmin',
          })
          authenticatedUser = await otherAdmin.toJson()
          await factory.create('Post', {
            id: 'created-by-one-admin-pinned-by-different-one',
            author: otherAdmin,
          })
        })

        it('responds with the updated Post', async () => {
          authenticatedUser = await admin.toJson()
          variables = { ...variables, id: 'created-by-one-admin-pinned-by-different-one' }
          const expected = {
            data: {
              pinPost: {
                id: 'created-by-one-admin-pinned-by-different-one',
                author: {
                  name: 'otherAdmin',
                },
                pinnedBy: {
                  id: 'current-user',
                  name: 'Admin',
                  role: 'admin',
                },
              },
            },
            errors: undefined,
          }

          await expect(mutate({ mutation: pinPostMutation, variables })).resolves.toMatchObject(
            expected,
          )
        })
      })

      describe('post created by another user', () => {
        it('responds with the updated Post', async () => {
          const expected = {
            data: {
              pinPost: {
                id: 'p9876',
                author: {
                  slug: 'the-author',
                },
                pinnedBy: {
                  id: 'current-user',
                  name: 'Admin',
                  role: 'admin',
                },
              },
            },
            errors: undefined,
          }

          await expect(mutate({ mutation: pinPostMutation, variables })).resolves.toMatchObject(
            expected,
          )
        })
      })

      describe('removes other pinned post', () => {
        let pinnedPost
        beforeEach(async () => {
          await factory.create('Post', {
            id: 'only-pinned-post',
            author: admin,
          })
          await mutate({ mutation: pinPostMutation, variables })
          variables = { ...variables, id: 'only-pinned-post' }
          await mutate({ mutation: pinPostMutation, variables })
          pinnedPost = await neode.cypher(
            `MATCH (:User)-[pinned:PINNED]->(post:Post) RETURN post, pinned`,
          )
        })

        it('leaves only one pinned post at a time', async () => {
          expect(pinnedPost.records).toHaveLength(1)
        })
      })

      describe('PostOrdering', () => {
        let pinnedPost, postCreatedAfterPinnedPost, newDate, timeInPast, admin
        beforeEach(async () => {
          ;[pinnedPost, postCreatedAfterPinnedPost] = await Promise.all([
            neode.create('Post', {
              id: 'im-a-pinned-post',
            }),
            neode.create('Post', {
              id: 'i-was-created-after-pinned-post',
            }),
          ])
          newDate = new Date()
          timeInPast = newDate.getDate() - 3
          newDate.setDate(timeInPast)
          await pinnedPost.update({
            createdAt: newDate.toISOString(),
            updatedAt: new Date().toISOString(),
          })
          timeInPast = newDate.getDate() + 1
          newDate.setDate(timeInPast)
          await postCreatedAfterPinnedPost.update({
            createdAt: newDate.toISOString(),
            updatedAt: new Date().toISOString(),
          })
          admin = await user.update({
            role: 'admin',
            name: 'Admin',
            updatedAt: new Date().toISOString(),
          })
          await admin.relateTo(pinnedPost, 'pinned')
        })

        it('pinned post appear first even when created before other posts', async () => {
          const postOrderingQuery = gql`
            query($orderBy: [_PostOrdering]) {
              Post(orderBy: $orderBy) {
                id
                pinnedAt
              }
            }
          `
          const expected = {
            data: {
              Post: [
                {
                  id: 'im-a-pinned-post',
                  pinnedAt: expect.any(String),
                },
                {
                  id: 'p9876',
                  pinnedAt: null,
                },
                {
                  id: 'i-was-created-after-pinned-post',
                  pinnedAt: null,
                },
              ],
            },
          }
          variables = { orderBy: ['pinnedAt_asc', 'createdAt_desc'] }
          await expect(query({ query: postOrderingQuery, variables })).resolves.toMatchObject(
            expected,
          )
        })
      })
    })
  })

  describe('unpin posts', () => {
    const unpinPostMutation = gql`
      mutation($id: ID!) {
        unpinPost(id: $id) {
          id
          title
          content
          author {
            name
            slug
          }
          pinnedBy {
            id
            name
            role
          }
          createdAt
          updatedAt
        }
      }
    `
    beforeEach(async () => {
      variables = { ...variables }
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = null
        await expect(mutate({ mutation: unpinPostMutation, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
          data: { unpinPost: null },
        })
      })
    })

    describe('users cannot unpin posts', () => {
      it('throws authorization error', async () => {
        await expect(mutate({ mutation: unpinPostMutation, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
          data: { unpinPost: null },
        })
      })
    })

    describe('moderators cannot unpin posts', () => {
      let moderator
      beforeEach(async () => {
        moderator = await user.update({ role: 'moderator', updatedAt: new Date().toISOString() })
        authenticatedUser = await moderator.toJson()
      })

      it('throws authorization error', async () => {
        await expect(mutate({ mutation: unpinPostMutation, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
          data: { unpinPost: null },
        })
      })
    })

    describe('admin can unpin posts', () => {
      let admin, pinnedPost
      beforeEach(async () => {
        pinnedPost = await factory.create('Post', { id: 'post-to-be-unpinned' })
        admin = await user.update({
          role: 'admin',
          name: 'Admin',
          updatedAt: new Date().toISOString(),
        })
        authenticatedUser = await admin.toJson()
        await admin.relateTo(pinnedPost, 'pinned', { createdAt: new Date().toISOString() })
      })

      it('responds with the unpinned Post', async () => {
        authenticatedUser = await admin.toJson()
        variables = { ...variables, id: 'post-to-be-unpinned' }
        const expected = {
          data: {
            unpinPost: {
              id: 'post-to-be-unpinned',
              pinnedBy: null,
            },
          },
          errors: undefined,
        }

        await expect(mutate({ mutation: unpinPostMutation, variables })).resolves.toMatchObject(
          expected,
        )
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
              from: { id: 'current-user' },
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
                  { emotion: 'happy', User: { id: 'current-user' } },
                  { emotion: 'surprised', User: { id: 'current-user' } },
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
                from: { id: 'current-user' },
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
