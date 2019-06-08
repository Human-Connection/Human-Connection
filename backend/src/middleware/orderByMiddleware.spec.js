import { GraphQLClient } from 'graphql-request'
import Factory from '../seed/factories'
import { host } from '../jest/helpers'

let client
let headers
let query
const factory = Factory()

beforeEach(async () => {
  const userParams = { name: 'Author', email: 'author@example.org', password: '1234' }
  await factory.create('User', userParams)
  await factory.authenticateAs(userParams)
  await factory.create('Post', { title: 'first' })
  await factory.create('Post', { title: 'second' })
  await factory.create('Post', { title: 'third' })
  await factory.create('Post', { title: 'last' })
  headers = {}
  client = new GraphQLClient(host, { headers })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('Query', () => {
  describe('Post', () => {
    beforeEach(() => {
      query = '{ Post { title } }'
    })

    describe('orderBy', () => {
      it('createdAt descending is default', async () => {
        const posts = [
          { title: 'last' },
          { title: 'third' },
          { title: 'second' },
          { title: 'first' },
        ]
        const expected = { Post: posts }
        await expect(client.request(query)).resolves.toEqual(expected)
      })

      describe('(orderBy: createdAt_asc)', () => {
        beforeEach(() => {
          query = '{ Post(orderBy: createdAt_asc) { title } }'
        })

        it('orders by createdAt ascending', async () => {
          const posts = [
            { title: 'first' },
            { title: 'second' },
            { title: 'third' },
            { title: 'last' },
          ]
          const expected = { Post: posts }
          await expect(client.request(query)).resolves.toEqual(expected)
        })
      })
    })
  })
})
