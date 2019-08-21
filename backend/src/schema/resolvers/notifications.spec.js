import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login, gql } from '../../jest/helpers'
import { neode } from '../../bootstrap/neo4j'

let client
const factory = Factory()
const instance = neode()
const userParams = {
  id: 'you',
  email: 'test@example.org',
  password: '1234',
}
const categoryIds = ['cat9']

beforeEach(async () => {
  await factory.create('User', userParams)
  await instance.create('Category', {
    id: 'cat9',
    name: 'Democracy & Politics',
    icon: 'university',
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('Notification', () => {
  const notificationQuery = gql`
    query {
      Notification {
        id
      }
    }
  `

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(notificationQuery)).rejects.toThrow('Not Authorised')
    })
  })
})

describe('currentUser notifications', () => {
  const variables = {}

  describe('authenticated', () => {
    let headers
    beforeEach(async () => {
      headers = await login({
        email: 'test@example.org',
        password: '1234',
      })
      client = new GraphQLClient(host, {
        headers,
      })
    })

    describe('given some notifications', () => {
      beforeEach(async () => {
        const neighborParams = {
          email: 'neighbor@example.org',
          password: '1234',
          id: 'neighbor',
        }
        await Promise.all([
          factory.create('User', neighborParams),
          factory.create('Notification', {
            id: 'post-mention-not-for-you',
          }),
          factory.create('Notification', {
            id: 'post-mention-already-seen',
            read: true,
          }),
          factory.create('Notification', {
            id: 'post-mention-unseen',
          }),
          factory.create('Notification', {
            id: 'comment-mention-not-for-you',
          }),
          factory.create('Notification', {
            id: 'comment-mention-already-seen',
            read: true,
          }),
          factory.create('Notification', {
            id: 'comment-mention-unseen',
          }),
        ])
        await factory.authenticateAs(neighborParams)
        await factory.create('Post', { id: 'p1', categoryIds })
        await Promise.all([
          factory.relate('Notification', 'User', {
            from: 'post-mention-not-for-you',
            to: 'neighbor',
          }),
          factory.relate('Notification', 'Post', {
            from: 'p1',
            to: 'post-mention-not-for-you',
          }),
          factory.relate('Notification', 'User', {
            from: 'post-mention-unseen',
            to: 'you',
          }),
          factory.relate('Notification', 'Post', {
            from: 'p1',
            to: 'post-mention-unseen',
          }),
          factory.relate('Notification', 'User', {
            from: 'post-mention-already-seen',
            to: 'you',
          }),
          factory.relate('Notification', 'Post', {
            from: 'p1',
            to: 'post-mention-already-seen',
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
            from: 'comment-mention-not-for-you',
            to: 'neighbor',
          }),
          factory.relate('Notification', 'Comment', {
            from: 'c1',
            to: 'comment-mention-not-for-you',
          }),
          factory.relate('Notification', 'User', {
            from: 'comment-mention-unseen',
            to: 'you',
          }),
          factory.relate('Notification', 'Comment', {
            from: 'c1',
            to: 'comment-mention-unseen',
          }),
          factory.relate('Notification', 'User', {
            from: 'comment-mention-already-seen',
            to: 'you',
          }),
          factory.relate('Notification', 'Comment', {
            from: 'c1',
            to: 'comment-mention-already-seen',
          }),
        ])
      })

      describe('filter for read: false', () => {
        const queryCurrentUserNotificationsFilterRead = gql`
          query($read: Boolean) {
            currentUser {
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
          }
        `
        const variables = { read: false }
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

      describe('no filters', () => {
        const queryCurrentUserNotifications = gql`
          query {
            currentUser {
              notifications(orderBy: createdAt_desc) {
                id
                post {
                  id
                }
                comment {
                  id
                }
              }
            }
          }
        `
        it('returns all notifications of current user', async () => {
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
                  id: 'post-mention-already-seen',
                  post: {
                    id: 'p1',
                  },
                  comment: null,
                },
                {
                  id: 'comment-mention-unseen',
                  comment: {
                    id: 'c1',
                  },
                  post: null,
                },
                {
                  id: 'comment-mention-already-seen',
                  comment: {
                    id: 'c1',
                  },
                  post: null,
                },
              ]),
            },
          }
          await expect(client.request(queryCurrentUserNotifications, variables)).resolves.toEqual(
            expected,
          )
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
        }),
        factory.create('Notification', {
          id: 'comment-mention-to-be-updated',
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
