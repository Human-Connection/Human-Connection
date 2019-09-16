import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

let factory
let driver

let query
let mutate
let authenticatedUser

let user1
let user2

const mutationFollowUser = id => `
  mutation {
    follow(id: "${id}", type: User)
  }
`
const mutationUnfollowUser = id => `
  mutation {
    unfollow(id: "${id}", type: User)
  }
`

beforeAll(() => {
  factory = Factory()
  driver = getDriver()

  const { server } = createServer({
    context: () => ({
      driver,
      user: authenticatedUser,
      cypherParams: {
        currentUserId: authenticatedUser ? authenticatedUser.id : null,
      },
    }),
  })

  const testClient = createTestClient(server)
  query = testClient.query
  mutate = testClient.mutate
})

beforeEach(async () => {
  user1 = await factory
    .create('User', {
      id: 'u1',
      email: 'test@example.org',
      password: '1234',
    })
    .then(user => user.toJson())
  user2 = await factory
    .create('User', {
      id: 'u2',
      email: 'test2@example.org',
      password: '1234',
    })
    .then(user => user.toJson())

  authenticatedUser = user1
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('follow', () => {
  describe('follow user', () => {
    describe('unauthenticated follow', () => {
      it('throws authorization error', async () => {
        authenticatedUser = null
        const { errors } = await mutate({
          mutation: mutationFollowUser('u2'),
        })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    it('I can follow another user', async () => {
      const { data: result } = await mutate({
        mutation: mutationFollowUser(user2.id),
      })

      const expected = { follow: true }
      expect(result).toMatchObject(expected)

      const {
        data: { User },
      } = await query({
        query: `{
          User(id: "${user2.id}") {
            followedBy { id }
            followedByCurrentUser
          }
        }`,
      })

      const expected2 = {
        followedBy: [{ id: user1.id }],
        followedByCurrentUser: true,
      }
      expect(User[0]).toMatchObject(expected2)
    })

    it('I can`t follow myself', async () => {
      const { data: result } = await mutate({
        mutation: mutationFollowUser(user1.id),
      })
      const expected = { follow: false }
      expect(result).toMatchObject(expected)

      const {
        data: { User },
      } = await query({
        query: `{
        User(id: "${user1.id}") {
          followedBy { id }
          followedByCurrentUser
        }
      }`,
      })
      const expected2 = {
        followedBy: [],
        followedByCurrentUser: false,
      }
      expect(User[0]).toMatchObject(expected2)
    })
  })
  describe('unfollow user', () => {
    beforeEach(async () => {
      await mutate({ mutation: mutationFollowUser(user2.id) })
    })

    describe('unauthenticated follow', () => {
      it('throws authorization error', async () => {
        authenticatedUser = null
        const { errors } = await mutate({ mutation: mutationUnfollowUser(user2.id) })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    it('I can unfollow a user', async () => {
      const { data: result } = await mutate({
        mutation: mutationUnfollowUser(user2.id),
      })

      const expected = {
        unfollow: true,
      }

      expect(result).toMatchObject(expected)

      const {
        data: { User },
      } = await query({
        query: `{
        User(id: "${user2.id}") {
          followedBy { id }
          followedByCurrentUser
        }
      }`,
      })
      const expected2 = {
        followedBy: [],
        followedByCurrentUser: false,
      }
      expect(User[0]).toMatchObject(expected2)
    })
  })
})
