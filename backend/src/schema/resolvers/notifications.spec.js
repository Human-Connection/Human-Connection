import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login, gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../.././server'

let client
const factory = Factory()
const neode = getNeode()
const driver = getDriver()
const userParams = {
  id: 'you',
  email: 'test@example.org',
  password: '1234',
}

let authenticatedUser
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

describe('notifications', () => {
  const notificationQuery = gql`
    query($read: Boolean, $orderBy: NOTIFIEDOrdering) {
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

  const setupNotifications = [
    `
MATCH(user:User {id: 'neighbor'})
MERGE (:Post {id: 'p1', content: 'Not for you'})
  -[:NOTIFIED {createdAt: "2019-08-29T17:33:48.651Z", read: false, reason: "mentioned_in_post"}]
  ->(user);
`,
    `
MATCH(user:User {id: 'you'})
MERGE (:Post {id: 'p2', content: 'Already seen post mentioning'})
  -[:NOTIFIED {createdAt: "2019-08-30T17:33:48.651Z", read: true, reason: "mentioned_in_post"}]
  ->(user);
`,
    `
MATCH(user:User {id: 'you'})
MERGE (:Post {id: 'p3', content: 'You have been mentioned in a post'})
  -[:NOTIFIED {createdAt: "2019-08-31T17:33:48.651Z", read: false, reason: "mentioned_in_post"}]
  ->(user);
`,
    `
MATCH(user:User {id: 'you'})
MATCH(post:Post {id: 'p3'})
CREATE (comment:Comment {id: 'c1', content: 'You have seen this comment mentioning already'})
MERGE (comment)-[:COMMENTS]->(post)
MERGE (comment)
  -[:NOTIFIED {createdAt: "2019-08-30T15:33:48.651Z", read: true, reason: "mentioned_in_comment"}]
  ->(user);
`,
    `
MATCH(user:User {id: 'you'})
MATCH(post:Post {id: 'p3'})
CREATE (comment:Comment {id: 'c2', content: 'You have been mentioned in a comment'})
MERGE (comment)-[:COMMENTS]->(post)
MERGE (comment)
  -[:NOTIFIED {createdAt: "2019-08-31T17:33:48.651Z", read: false, reason: "mentioned_in_comment"}]
  ->(user);
`,
    `
MATCH(user:User {id: 'neighbor'})
MATCH(post:Post {id: 'p3'})
CREATE (comment:Comment {id: 'c3', content: 'Somebody else was mentioned in a comment'})
MERGE (comment)-[:COMMENTS]->(post)
MERGE (comment)
  -[:NOTIFIED {createdAt: "2019-09-01T17:33:48.651Z", read: false, reason: "mentioned_in_comment"}]
  ->(user);
  `,
  ]

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      const result = await query({ query: notificationQuery })
      expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      const user = await factory.create('User', userParams)
      authenticatedUser = await user.toJson()
    })

    describe('given some notifications', () => {
      beforeEach(async () => {
        await factory.create('User', { id: 'neighbor' })
        await Promise.all(setupNotifications.map(s => neode.cypher(s)))
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
                  createdAt: '2019-08-31T17:33:48.651Z',
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
        const queryCurrentUserNotificationsFilterRead = gql`
          query($read: Boolean) {
            notifications(read: $read, orderBy: createdAt_desc) {
              id
              post {
                id
              }
              comment {
                id
              }
            }
          }
        `

        it('returns only unread notifications of current user', async () => {
          const expected = {
            currentUser: {
              notifications: expect.arrayContaining([
                {
                  id: 'post-mention-unseen',
                  post: {
                    id: 'p1',
                  },
                  comment: null,
                },
                {
                  id: 'comment-mention-unseen',
                  post: null,
                  comment: {
                    id: 'c1',
                  },
                },
              ]),
            },
          }
          await expect(
            client.request(queryCurrentUserNotificationsFilterRead, variables),
          ).resolves.toEqual(expected)
        })
      })
    })
  })
})

describe('UpdateNotification', () => {
  const mutationUpdateNotification = gql`
    mutation($id: ID!, $read: Boolean) {
      UpdateNotification(id: $id, read: $read) {
        id
        read
      }
    }
  `
  const variablesPostUpdateNotification = {
    id: 'post-mention-to-be-updated',
    read: true,
  }
  const variablesCommentUpdateNotification = {
    id: 'comment-mention-to-be-updated',
    read: true,
  }

  describe('given some notifications', () => {
    let headers

    beforeEach(async () => {
      const mentionedParams = {
        id: 'mentioned-1',
        email: 'mentioned@example.org',
        password: '1234',
        slug: 'mentioned',
      }
      await Promise.all([
        factory.create('User', mentionedParams),
        factory.create('Notification', {
          id: 'post-mention-to-be-updated',
          reason: 'mentioned_in_post',
        }),
        factory.create('Notification', {
          id: 'comment-mention-to-be-updated',
          reason: 'mentioned_in_comment',
        }),
      ])
      await factory.authenticateAs(userParams)
      await factory.create('Post', { id: 'p1', categoryIds })
      await Promise.all([
        factory.relate('Notification', 'User', {
          from: 'post-mention-to-be-updated',
          to: 'mentioned-1',
        }),
        factory.relate('Notification', 'Post', {
          from: 'p1',
          to: 'post-mention-to-be-updated',
        }),
      ])
      // Comment and its notifications
      await Promise.all([
        factory.create('Comment', {
          id: 'c1',
          postId: 'p1',
        }),
      ])
      await Promise.all([
        factory.relate('Notification', 'User', {
          from: 'comment-mention-to-be-updated',
          to: 'mentioned-1',
        }),
        factory.relate('Notification', 'Comment', {
          from: 'p1',
          to: 'comment-mention-to-be-updated',
        }),
      ])
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(
          client.request(mutationUpdateNotification, variablesPostUpdateNotification),
        ).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated', () => {
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
        await expect(
          client.request(mutationUpdateNotification, variablesPostUpdateNotification),
        ).rejects.toThrow('Not Authorised')
      })

      describe('and owner', () => {
        beforeEach(async () => {
          headers = await login({
            email: 'mentioned@example.org',
            password: '1234',
          })
          client = new GraphQLClient(host, {
            headers,
          })
        })

        it('updates post notification', async () => {
          const expected = {
            UpdateNotification: {
              id: 'post-mention-to-be-updated',
              read: true,
            },
          }
          await expect(
            client.request(mutationUpdateNotification, variablesPostUpdateNotification),
          ).resolves.toEqual(expected)
        })

        it('updates comment notification', async () => {
          const expected = {
            UpdateNotification: {
              id: 'comment-mention-to-be-updated',
              read: true,
            },
          }
          await expect(
            client.request(mutationUpdateNotification, variablesCommentUpdateNotification),
          ).resolves.toEqual(expected)
        })
      })
    })
  })
})
