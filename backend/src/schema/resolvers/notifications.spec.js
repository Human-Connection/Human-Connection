import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../.././server'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()
const userParams = {
  id: 'you',
  email: 'test@example.org',
  password: '1234',
}

let authenticatedUser
let user
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
    user = await factory.create('User', userParams)
    await factory.create('User', { id: 'neighbor' })
    await Promise.all(setupNotifications.map(s => neode.cypher(s)))
  })
  const setupNotifications = [
    `MATCH(user:User {id: 'neighbor'})
    MERGE (:Post {id: 'p1', content: 'Not for you'})
      -[:NOTIFIED {createdAt: "2019-08-29T17:33:48.651Z", read: false, reason: "mentioned_in_post"}]
      ->(user);
    `,
    `MATCH(user:User {id: 'you'})
    MERGE (:Post {id: 'p2', content: 'Already seen post mentioning'})
      -[:NOTIFIED {createdAt: "2019-08-30T17:33:48.651Z", read: true, reason: "mentioned_in_post"}]
      ->(user);
    `,
    `MATCH(user:User {id: 'you'})
    MERGE (:Post {id: 'p3', content: 'You have been mentioned in a post'})
      -[:NOTIFIED {createdAt: "2019-08-31T17:33:48.651Z", read: false, reason: "mentioned_in_post"}]
      ->(user);
    `,
    `MATCH(user:User {id: 'you'})
    MATCH(post:Post {id: 'p3'})
    CREATE (comment:Comment {id: 'c1', content: 'You have seen this comment mentioning already'})
    MERGE (comment)-[:COMMENTS]->(post)
    MERGE (comment)
      -[:NOTIFIED {createdAt: "2019-08-30T15:33:48.651Z", read: true, reason: "mentioned_in_comment"}]
      ->(user);
    `,
    `MATCH(user:User {id: 'you'})
    MATCH(post:Post {id: 'p3'})
    CREATE (comment:Comment {id: 'c2', content: 'You have been mentioned in a comment'})
    MERGE (comment)-[:COMMENTS]->(post)
    MERGE (comment)
      -[:NOTIFIED {createdAt: "2019-08-30T19:33:48.651Z", read: false, reason: "mentioned_in_comment"}]
      ->(user);
    `,
    `MATCH(user:User {id: 'neighbor'})
    MATCH(post:Post {id: 'p3'})
    CREATE (comment:Comment {id: 'c3', content: 'Somebody else was mentioned in a comment'})
    MERGE (comment)-[:COMMENTS]->(post)
    MERGE (comment)
      -[:NOTIFIED {createdAt: "2019-09-01T17:33:48.651Z", read: false, reason: "mentioned_in_comment"}]
      ->(user);
  `,
  ]

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
        const result = await query({ query: notificationQuery })
        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        authenticatedUser = await user.toJson()
      })

      describe('no filters', () => {
        it('returns all notifications of current user', async () => {
          const expected = expect.objectContaining({
            data: {
              notifications: [
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
                    content: 'Already seen post mentioning',
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
              ],
            },
          })
          await expect(query({ query: notificationQuery, variables })).resolves.toEqual(expected)
        })
      })

      describe('filter for read: false', () => {
        it('returns only unread notifications of current user', async () => {
          const expected = expect.objectContaining({
            data: {
              notifications: [
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
              ],
            },
          })
          await expect(
            query({ query: notificationQuery, variables: { ...variables, read: false } }),
          ).resolves.toEqual(expected)
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
