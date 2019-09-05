import { gql } from '../../jest/helpers'
import Factory from '../../seed/factories'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()

let authenticatedUser
let user
let query

const currentUserParams = {
  id: 'u1',
  email: 'you@example.org',
  name: 'This is you',
  password: '1234',
}
const followedAuthorParams = {
  id: 'u2',
  email: 'followed@example.org',
  name: 'Followed User',
  password: '1234',
}
const randomAuthorParams = {
  email: 'someone@example.org',
  name: 'Someone else',
  password: 'else',
}
const categoryIds = ['cat9']

beforeEach(async () => {
  const [currentUser, followedAuthor, randomAuthor] = await Promise.all([
    factory.create('User', currentUserParams),
    factory.create('User', followedAuthorParams),
    factory.create('User', randomAuthorParams),
  ])
  user = currentUser
  await neode.create('Category', {
    id: 'cat9',
    name: 'Democracy & Politics',
    icon: 'university',
  })
  await currentUser.relateTo(followedAuthor, 'following')
  await factory.create('Post', {
    author: followedAuthor,
    title: 'This is the post of a followed user',
    categoryIds,
  })
  await factory.create('Post', {
    author: randomAuthor,
    title: 'This is some random post',
    categoryIds,
  })
})

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      return {
        driver,
        neode,
        user: authenticatedUser,
      }
    },
  })
  const client = createTestClient(server)
  query = client.query
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('Filter posts by author is followed by sb.', () => {
  describe('given an authenticated user', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    describe('no filter bubble', () => {
      it('returns all posts', async () => {
        const postQuery = gql`
          {
            Post(filter: {}) {
              title
            }
          }
        `
        const expected = {
          data: {
            Post: [
              { title: 'This is some random post' },
              { title: 'This is the post of a followed user' },
            ],
          },
        }
        await expect(query({ query: postQuery })).resolves.toMatchObject(expected)
      })
    })

    describe('filtering for posts of followed users only', () => {
      it('returns only posts authored by followed users', async () => {
        const postQuery = gql`
          {
            Post(filter: { author: { followedBy_some: { id: "u1" } } }) {
              title
            }
          }
        `
        const expected = {
          data: { Post: [{ title: 'This is the post of a followed user' }] },
        }
        await expect(query({ query: postQuery })).resolves.toMatchObject(expected)
      })
    })
  })
})
