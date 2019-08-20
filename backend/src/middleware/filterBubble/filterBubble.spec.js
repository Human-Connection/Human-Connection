import { GraphQLClient } from 'graphql-request'
import { host, login } from '../../jest/helpers'
import Factory from '../../seed/factories'
import { neode } from '../../bootstrap/neo4j'

const factory = Factory()
const instance = neode()

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
  await Promise.all([
    factory.create('User', currentUserParams),
    factory.create('User', followedAuthorParams),
    factory.create('User', randomAuthorParams),
  ])
  await instance.create('Category', {
    id: 'cat9',
    name: 'Democracy & Politics',
    icon: 'university',
  })
  const [asYourself, asFollowedUser, asSomeoneElse] = await Promise.all([
    Factory().authenticateAs(currentUserParams),
    Factory().authenticateAs(followedAuthorParams),
    Factory().authenticateAs(randomAuthorParams),
  ])
  await asYourself.follow({ id: 'u2', type: 'User' })
  await asFollowedUser.create('Post', { title: 'This is the post of a followed user', categoryIds })
  await asSomeoneElse.create('Post', { title: 'This is some random post', categoryIds })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('Filter posts by author is followed by sb.', () => {
  describe('given an authenticated user', () => {
    let authenticatedClient

    beforeEach(async () => {
      const headers = await login(currentUserParams)
      authenticatedClient = new GraphQLClient(host, { headers })
    })

    describe('no filter bubble', () => {
      it('returns all posts', async () => {
        const query = '{ Post(filter: { }) { title } }'
        const expected = {
          Post: [
            { title: 'This is some random post' },
            { title: 'This is the post of a followed user' },
          ],
        }
        await expect(authenticatedClient.request(query)).resolves.toEqual(expected)
      })
    })

    describe('filtering for posts of followed users only', () => {
      it('returns only posts authored by followed users', async () => {
        const query = '{ Post( filter: { author: { followedBy_some: { id: "u1" } } }) { title } }'
        const expected = {
          Post: [{ title: 'This is the post of a followed user' }],
        }
        await expect(authenticatedClient.request(query)).resolves.toEqual(expected)
      })
    })
  })
})
