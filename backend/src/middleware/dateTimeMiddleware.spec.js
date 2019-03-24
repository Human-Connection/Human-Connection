import Factory from '../seed/factories'
import { host, login } from '../jest/helpers'
import { GraphQLClient } from 'graphql-request'

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
    describe('orderBy', () => {
      it('createdAt descending is default', async () => {
        query = '{ Post { title } }'
        const posts = [
          { title: 'last' },
          { title: 'third' },
          { title: 'second' },
          { title: 'first' }
        ]
        const expected = { data: { Post: posts } }
        await expect(client.request(query)).resolves.toEqual(expected)
      })
    })
  })
})
