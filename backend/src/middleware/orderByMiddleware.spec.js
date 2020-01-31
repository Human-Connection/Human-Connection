import { gql } from '../helpers/jest'
import { cleanDatabase } from '../db/factories'
import { getNeode, getDriver } from '../db/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../server'

const neode = getNeode()
const driver = getDriver()

const { server } = createServer({
  context: () => {
    return {
      user: null,
      neode,
      driver,
    }
  },
})
const { query } = createTestClient(server)

beforeEach(async () => {
  await neode.create('Post', { title: 'first' })
  await neode.create('Post', { title: 'second' })
  await neode.create('Post', { title: 'third' })
  await neode.create('Post', { title: 'last' })
})

afterEach(async () => {
  await cleanDatabase()
})

describe('Query', () => {
  describe('Post', () => {
    describe('orderBy', () => {
      it('createdAt descending is default', async () => {
        const posts = [
          { title: 'last' },
          { title: 'third' },
          { title: 'second' },
          { title: 'first' },
        ]
        const expected = expect.objectContaining({ data: { Post: posts } })
        await expect(
          query({
            query: gql`
              {
                Post {
                  title
                }
              }
            `,
          }),
        ).resolves.toEqual(expected)
      })

      describe('(orderBy: createdAt_asc)', () => {
        it('orders by createdAt ascending', async () => {
          const posts = [
            { title: 'first' },
            { title: 'second' },
            { title: 'third' },
            { title: 'last' },
          ]
          const expected = expect.objectContaining({ data: { Post: posts } })
          await expect(
            query({
              query: gql`
                {
                  Post(orderBy: createdAt_asc) {
                    title
                  }
                }
              `,
            }),
          ).resolves.toEqual(expected)
        })
      })
    })
  })
})
