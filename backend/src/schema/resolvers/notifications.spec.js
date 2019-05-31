import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()
let client
let userParams = {
  id: 'you',
  email: 'test@example.org',
  password: '1234',
}

beforeEach(async () => {
  await factory.create('User', userParams)
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
          id: 'neighbor',
        }
        await Promise.all([
          factory.create('User', neighborParams),
          factory.create('Notification', { id: 'not-for-you' }),
          factory.create('Notification', { id: 'already-seen', read: true }),
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
          factory.relate('Notification', 'Post', { from: 'p1', to: 'already-seen' }),
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
              notifications: [{ id: 'unseen', post: { id: 'p1' } }],
            },
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
                { id: 'already-seen', post: { id: 'p1' } },
              ],
            },
          }
          await expect(client.request(query, variables)).resolves.toEqual(expected)
        })
      })
    })
  })
})

describe('UpdateNotification', () => {
  const mutation = `mutation($id: ID!, $read: Boolean){
    UpdateNotification(id: $id, read: $read) {
      id read
    }
  }`
  const variables = { id: 'to-be-updated', read: true }

  describe('given a notifications', () => {
    let headers

    beforeEach(async () => {
      const mentionedParams = {
        id: 'mentioned-1',
        email: 'mentioned@example.org',
        password: '1234',
        slug: 'mentioned',
      }
      await factory.create('User', mentionedParams)
      await factory.create('Notification', { id: 'to-be-updated' })
      await factory.authenticateAs(userParams)
      await factory.create('Post', { id: 'p1' })
      await Promise.all([
        factory.relate('Notification', 'User', { from: 'to-be-updated', to: 'mentioned-1' }),
        factory.relate('Notification', 'Post', { from: 'p1', to: 'to-be-updated' }),
      ])
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        headers = await login({ email: 'test@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('throws authorization error', async () => {
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })

      describe('and owner', () => {
        beforeEach(async () => {
          headers = await login({ email: 'mentioned@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('updates notification', async () => {
          const expected = { UpdateNotification: { id: 'to-be-updated', read: true } }
          await expect(client.request(mutation, variables)).resolves.toEqual(expected)
        })
      })
    })
  })
})
