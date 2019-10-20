import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { getDriver } from '../../bootstrap/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../.././server'

const factory = Factory()
const driver = getDriver()
let authenticatedUser
let user
let author
let variables
let query
let mutate

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      return {
        driver,
        user: authenticatedUser,
      }
    },
  })
  query = createTestClient(server).query
  mutate = createTestClient(server).mutate
})

beforeEach(async () => {
  authenticatedUser = null
  variables = { orderBy: 'createdAt_asc' }
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('given some notifications', () => {
  beforeEach(async () => {
    const categoryIds = ['cat1']
    author = await factory.create('User', { id: 'author' })
    user = await factory.create('User', { id: 'you' })
    const [neighbor] = await Promise.all([
      factory.create('User', { id: 'neighbor' }),
      factory.create('Category', { id: 'cat1' }),
    ])
    const [post1, post2, post3] = await Promise.all([
      factory.create('Post', { author, id: 'p1', categoryIds, content: 'Not for you' }),
      factory.create('Post', {
        author,
        id: 'p2',
        categoryIds,
        content: 'Already seen post mention',
      }),
      factory.create('Post', {
        author,
        id: 'p3',
        categoryIds,
        content: 'You have been mentioned in a post',
      }),
    ])
    const [comment1, comment2, comment3] = await Promise.all([
      factory.create('Comment', {
        author,
        postId: 'p3',
        id: 'c1',
        content: 'You have seen this comment mentioning already',
      }),
      factory.create('Comment', {
        author,
        postId: 'p3',
        id: 'c2',
        content: 'You have been mentioned in a comment',
      }),
      factory.create('Comment', {
        author,
        postId: 'p3',
        id: 'c3',
        content: 'Somebody else was mentioned in a comment',
      }),
    ])
    await Promise.all([
      post1.relateTo(neighbor, 'notified', {
        createdAt: '2019-08-29T17:33:48.651Z',
        read: false,
        reason: 'mentioned_in_post',
      }),
      post2.relateTo(user, 'notified', {
        createdAt: '2019-08-30T17:33:48.651Z',
        read: true,
        reason: 'mentioned_in_post',
      }),
      post3.relateTo(user, 'notified', {
        createdAt: '2019-08-31T17:33:48.651Z',
        read: false,
        reason: 'mentioned_in_post',
      }),
      comment1.relateTo(user, 'notified', {
        createdAt: '2019-08-30T15:33:48.651Z',
        read: true,
        reason: 'mentioned_in_comment',
      }),
      comment2.relateTo(user, 'notified', {
        createdAt: '2019-08-30T19:33:48.651Z',
        read: false,
        reason: 'mentioned_in_comment',
      }),
      comment3.relateTo(neighbor, 'notified', {
        createdAt: '2019-09-01T17:33:48.651Z',
        read: false,
        reason: 'mentioned_in_comment',
      }),
    ])
  })

  describe('notifications', () => {
    const notificationQuery = gql`
      query($read: Boolean, $orderBy: NotificationOrdering) {
        notifications(read: $read, orderBy: $orderBy) {
          from {
            __typename
            ... on Post {
              content
            }
            ... on Comment {
              content
            }
          }
          read
          createdAt
        }
      }
    `
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        const { errors } = await query({ query: notificationQuery })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        authenticatedUser = await user.toJson()
      })

      describe('no filters', () => {
        it('returns all notifications of current user', async () => {
          const expected = [
            {
              from: {
                __typename: 'Comment',
                content: 'You have seen this comment mentioning already',
              },
              read: true,
              createdAt: '2019-08-30T15:33:48.651Z',
            },
            {
              from: {
                __typename: 'Post',
                content: 'Already seen post mention',
              },
              read: true,
              createdAt: '2019-08-30T17:33:48.651Z',
            },
            {
              from: {
                __typename: 'Comment',
                content: 'You have been mentioned in a comment',
              },
              read: false,
              createdAt: '2019-08-30T19:33:48.651Z',
            },
            {
              from: {
                __typename: 'Post',
                content: 'You have been mentioned in a post',
              },
              read: false,
              createdAt: '2019-08-31T17:33:48.651Z',
            },
          ]

          await expect(query({ query: notificationQuery, variables })).resolves.toMatchObject({
            data: {
              notifications: expect.arrayContaining(expected),
            },
          })
        })
      })

      describe('filter for read: false', () => {
        it('returns only unread notifications of current user', async () => {
          const expected = expect.objectContaining({
            data: {
              notifications: expect.arrayContaining([
                {
                  from: {
                    __typename: 'Comment',
                    content: 'You have been mentioned in a comment',
                  },
                  read: false,
                  createdAt: '2019-08-30T19:33:48.651Z',
                },
                {
                  from: {
                    __typename: 'Post',
                    content: 'You have been mentioned in a post',
                  },
                  read: false,
                  createdAt: '2019-08-31T17:33:48.651Z',
                },
              ]),
            },
          })
          const response = await query({
            query: notificationQuery,
            variables: { ...variables, read: false },
          })
          await expect(response).toMatchObject(expected)
          await expect(response.data.notifications.length).toEqual(2) // double-check
        })

        describe('if a resource gets deleted', () => {
          const deletePostAction = async () => {
            authenticatedUser = await author.toJson()
            const deletePostMutation = gql`
              mutation($id: ID!) {
                DeletePost(id: $id) {
                  id
                  deleted
                }
              }
            `
            await expect(
              mutate({ mutation: deletePostMutation, variables: { id: 'p3' } }),
            ).resolves.toMatchObject({ data: { DeletePost: { id: 'p3', deleted: true } } })
            authenticatedUser = await user.toJson()
          }

          it('reduces notifications list', async () => {
            await expect(
              query({ query: notificationQuery, variables: { ...variables, read: false } }),
            ).resolves.toMatchObject({
              data: { notifications: [expect.any(Object), expect.any(Object)] },
            })
            await deletePostAction()
            await expect(
              query({ query: notificationQuery, variables: { ...variables, read: false } }),
            ).resolves.toMatchObject({ data: { notifications: [] } })
          })
        })
      })
    })
  })

  describe('markAsRead', () => {
    const markAsReadMutation = gql`
      mutation($id: ID!) {
        markAsRead(id: $id) {
          from {
            __typename
            ... on Post {
              content
            }
            ... on Comment {
              content
            }
          }
          read
          createdAt
        }
      }
    `
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        const result = await mutate({
          mutation: markAsReadMutation,
          variables: { ...variables, id: 'p1' },
        })
        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        authenticatedUser = await user.toJson()
      })

      describe('not being notified at all', () => {
        beforeEach(async () => {
          variables = {
            ...variables,
            id: 'p1',
          }
        })

        it('returns null', async () => {
          const response = await mutate({ mutation: markAsReadMutation, variables })
          expect(response.data.markAsRead).toEqual(null)
          expect(response.errors).toBeUndefined()
        })
      })

      describe('being notified', () => {
        describe('on a post', () => {
          beforeEach(async () => {
            variables = {
              ...variables,
              id: 'p3',
            }
          })

          it('updates `read` attribute and returns NOTIFIED relationship', async () => {
            const { data } = await mutate({ mutation: markAsReadMutation, variables })
            expect(data).toEqual({
              markAsRead: {
                from: {
                  __typename: 'Post',
                  content: 'You have been mentioned in a post',
                },
                read: true,
                createdAt: '2019-08-31T17:33:48.651Z',
              },
            })
          })

          describe('but notification was already marked as read', () => {
            beforeEach(async () => {
              variables = {
                ...variables,
                id: 'p2',
              }
            })
            it('returns null', async () => {
              const response = await mutate({ mutation: markAsReadMutation, variables })
              expect(response.data.markAsRead).toEqual(null)
              expect(response.errors).toBeUndefined()
            })
          })
        })

        describe('on a comment', () => {
          beforeEach(async () => {
            variables = {
              ...variables,
              id: 'c2',
            }
          })

          it('updates `read` attribute and returns NOTIFIED relationship', async () => {
            const { data } = await mutate({ mutation: markAsReadMutation, variables })
            expect(data).toEqual({
              markAsRead: {
                from: {
                  __typename: 'Comment',
                  content: 'You have been mentioned in a comment',
                },
                read: true,
                createdAt: '2019-08-30T19:33:48.651Z',
              },
            })
          })
        })
      })
    })
  })
})
