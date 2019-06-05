import { GraphQLClient } from 'graphql-request'
import { host, login } from '../../jest/helpers'
import Factory from '../../seed/factories'

const factory = Factory()

const currentUserParams = {
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

beforeEach(async () => {
  await Promise.all([
    factory.create('User', currentUserParams),
    factory.create('User', followedAuthorParams),
    factory.create('User', randomAuthorParams),
  ])
  const [asYourself, asFollowedUser, asSomeoneElse] = await Promise.all([
    Factory().authenticateAs(currentUserParams),
    Factory().authenticateAs(followedAuthorParams),
    Factory().authenticateAs(randomAuthorParams),
  ])
  await asYourself.follow({ id: 'u2', type: 'User' })
  await asFollowedUser.create('Post', { title: 'This is the post of a followed user' })
  await asSomeoneElse.create('Post', { title: 'This is some random post' })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('FilterBubble middleware', () => {
  describe('given an authenticated user', () => {
    let authenticatedClient

    beforeEach(async () => {
      const headers = await login(currentUserParams)
      authenticatedClient = new GraphQLClient(host, { headers })
    })

    describe('no filter bubble', () => {
      it('returns all posts', async () => {
        const query = '{ Post( filterBubble: {}) { title } }'
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
        const query = '{ Post( filterBubble: { author: following }) { title } }'
        const expected = {
          Post: [{ title: 'This is the post of a followed user' }],
        }
        await expect(authenticatedClient.request(query)).resolves.toEqual(expected)
      })
    })
  })
})
