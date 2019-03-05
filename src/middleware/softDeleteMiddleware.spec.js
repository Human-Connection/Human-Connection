import Factory from '../seed/factories'
import { host, login } from '../jest/helpers'
import { GraphQLClient } from 'graphql-request'

const factory = Factory()
let client
let query
let action

beforeEach(async () => {
  await Promise.all([
    factory.create('User', { role: 'user', email: 'user@example.org', password: '1234' }),
    factory.create('User', { id: 'm1', role: 'moderator', email: 'moderator@example.org', password: '1234' })
  ])
  await factory.authenticateAs({ email: 'user@example.org', password: '1234' })
  await Promise.all([
    factory.create('Post', { title: 'Deleted post', deleted: true }),
    factory.create('Post', { id: 'p2', title: 'Disabled post', deleted: false }),
    factory.create('Post', { title: 'Publicly visible post', deleted: false })
  ])
  const moderatorFactory = Factory()
  await moderatorFactory.authenticateAs({ email: 'moderator@example.org', password: '1234' })
  await moderatorFactory.relate('Post', 'DisabledBy', { from: 'm1', to: 'p2' })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('softDeleteMiddleware', () => {
  describe('Post', () => {
    action = () => {
      return client.request(query)
    }

    beforeEach(() => {
      query = '{ Post { title } }'
    })

    describe('as user', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'user@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('hides deleted or disabled posts', async () => {
        const expected = { Post: [{ title: 'Publicly visible post' }] }
        await expect(action()).resolves.toEqual(expected)
      })
    })

    describe('as moderator', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('hides deleted or disabled posts', async () => {
        const expected = { Post: [{ title: 'Publicly visible post' }] }
        await expect(action()).resolves.toEqual(expected)
      })
    })

    describe('filter (deleted: true)', () => {
      beforeEach(() => {
        query = '{ Post(deleted: true) { title } }'
      })

      describe('as user', () => {
        beforeEach(async () => {
          const headers = await login({ email: 'user@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('throws authorisation error', async () => {
          await expect(action()).rejects.toThrow('Not Authorised!')
        })
      })

      describe('as moderator', () => {
        beforeEach(async () => {
          const headers = await login({ email: 'moderator@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('shows deleted posts', async () => {
          const expected = { Post: [{ title: 'Deleted post' }] }
          await expect(action()).resolves.toEqual(expected)
        })
      })
    })

    describe('filter (disabled: true)', () => {
      beforeEach(() => {
        query = '{ Post(disabled: true) { title } }'
      })

      describe('as user', () => {
        beforeEach(async () => {
          const headers = await login({ email: 'user@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('throws authorisation error', async () => {
          await expect(action()).rejects.toThrow('Not Authorised!')
        })
      })

      describe('as moderator', () => {
        beforeEach(async () => {
          const headers = await login({ email: 'moderator@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('shows disabled posts', async () => {
          const expected = { Post: [{ title: 'Disabled post' }] }
          await expect(action()).resolves.toEqual(expected)
        })
      })
    })
  })
})
