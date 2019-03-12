import Factory from '../seed/factories'
import { host, login } from '../jest/helpers'
import { GraphQLClient } from 'graphql-request'

const factory = Factory()
let client
let query
let action

beforeEach(async () => {
  await Promise.all([
    factory.create('User', { id: 'u1', role: 'user', email: 'user@example.org', password: '1234' }),
    factory.create('User', { id: 'm1', role: 'moderator', email: 'moderator@example.org', password: '1234' })
  ])
  await factory.authenticateAs({ email: 'user@example.org', password: '1234' })
  await Promise.all([
    await factory.create('Post', { id: 'p1', title: 'Deleted post', deleted: true }),
    await factory.create('Post', { id: 'p2', title: 'Disabled post', deleted: false }),
    await factory.create('Post', { id: 'p3', title: 'Publicly visible post', deleted: false })
  ])
  const moderatorFactory = Factory()
  await moderatorFactory.authenticateAs({ email: 'moderator@example.org', password: '1234' })
  const disableMutation = `
      mutation {
        disable(
          id: "p2"
        )
      }
    `
  await moderatorFactory.mutate(disableMutation)
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

      it('shows disabled but hides deleted posts', async () => {
        const expected = [
          { title: 'Disabled post' },
          { title: 'Publicly visible post' }
        ]
        const { Post } = await action()
        await expect(Post).toEqual(expect.arrayContaining(expected))
      })
    })

    describe('.comments', () => {
      beforeEach(async () => {
        query = '{ Post(id: "p3") { title comments { content } } }'

        const asModerator = Factory()
        await asModerator.authenticateAs({ email: 'moderator@example.org', password: '1234' })
        await Promise.all([
          asModerator.create('Comment', { id: 'c1', content: 'Disabled comment' }),
          asModerator.create('Comment', { id: 'c2', content: 'Enabled comment on public post' })
        ])
        await Promise.all([
          asModerator.relate('Comment', 'Author', { from: 'u1', to: 'c1' }),
          asModerator.relate('Comment', 'Post', { from: 'c1', to: 'p3' }),
          asModerator.relate('Comment', 'Author', { from: 'u1', to: 'c2' }),
          asModerator.relate('Comment', 'Post', { from: 'c2', to: 'p3' })
        ])
        await asModerator.mutate('mutation { disable( id: "c1") }')
      })

      describe('as user', () => {
        beforeEach(async () => {
          const headers = await login({ email: 'user@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('hides disabled comments', async () => {
          const expected = { Post: [ {
            title: 'Publicly visible post',
            comments: [
              { content: 'Enabled comment on public post' }
            ]
          }
          ] }
          await expect(action()).resolves.toEqual(expected)
        })
      })

      describe('as moderator', () => {
        beforeEach(async () => {
          const headers = await login({ email: 'moderator@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('shows disabled comments', async () => {
          const expected = [
            { content: 'Enabled comment on public post' },
            { content: 'Disabled comment' }
          ]
          const { Post: [{ comments }] } = await action()

          await expect(comments).toEqual(expect.arrayContaining(expected))
        })
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
