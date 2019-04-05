
import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()
let client

beforeEach(async () => {
  await factory.create('User', {
    id: 'you',
    email: 'test@example.org',
    password: '1234'
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('Notification', () => {
  const query = `{
    Notification {
      id
    }
  }`

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(query)).rejects.toThrow('Not Authorised')
    })
  })
})

describe('currentUser { notifications }', () => {
  let variables = {}

  describe('authenticated', () => {
    let headers
    beforeEach(async () => {
      headers = await login({ email: 'test@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
    })

    describe('given some notifications', () => {
      beforeEach(async () => {
        const neighborParams = {
          email: 'neighbor@example.org',
          password: '1234',
          id: 'neighbor'
        }
        await Promise.all([
          factory.create('User', neighborParams),
          factory.create('Notification', { id: 'not-for-you' }),
          factory.create('Notification', { id: 'already-seen', read: true })
        ])
        await factory.create('Notification', { id: 'unseen' })
        await factory.authenticateAs(neighborParams)
        await factory.create('Post', { id: 'p1' })
        await Promise.all([
          factory.relate('Notification', 'User', { from: 'not-for-you', to: 'neighbor' }),
          factory.relate('Notification', 'Post', { from: 'p1', to: 'not-for-you' }),
          factory.relate('Notification', 'User', { from: 'unseen', to: 'you' }),
          factory.relate('Notification', 'Post', { from: 'p1', to: 'unseen' }),
          factory.relate('Notification', 'User', { from: 'already-seen', to: 'you' }),
          factory.relate('Notification', 'Post', { from: 'p1', to: 'already-seen' })
        ])
      })

      describe('filter for read: false', () => {
        const query = `query($read: Boolean) {
          currentUser {
            notifications(read: $read, orderBy: createdAt_desc) {
              id
              post {
                id
              }
            }
          }
        }`
        let variables = { read: false }
        it('returns only unread notifications of current user', async () => {
          const expected = {
            currentUser: {
              notifications: [
                { id: 'unseen', post: { id: 'p1' } }
              ]
            }
          }
          await expect(client.request(query, variables)).resolves.toEqual(expected)
        })
      })

      describe('no filters', () => {
        const query = `{
          currentUser {
            notifications(orderBy: createdAt_desc) {
              id
              post {
                id
              }
            }
          }
        }`
        it('returns all notifications of current user', async () => {
          const expected = {
            currentUser: {
              notifications: [
                { id: 'unseen', post: { id: 'p1' } },
                { id: 'already-seen', post: { id: 'p1' } }
              ]
            }
          }
          await expect(client.request(query, variables)).resolves.toEqual(expected)
        })
      })
    })
  })
})
