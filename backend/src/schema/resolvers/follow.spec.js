import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'
import { gql } from '../../jest/helpers'

const factory = Factory()
const driver = getDriver()

let query
let mutate
let authenticatedUser

let user1
let user2
let variables

const mutationFollowUser = gql`
  mutation($id: ID!, $type: FollowTypeEnum) {
    follow(id: $id, type: $type) {
      name
      followedBy {
        id
        name
      }
      followedByCurrentUser
    }
  }
`

const mutationUnfollowUser = gql`
  mutation($id: ID!, $type: FollowTypeEnum) {
    unfollow(id: $id, type: $type) {
      name
      followedBy {
        id
        name
      }
      followedByCurrentUser
    }
  }
`

const userQuery = gql`
  query($id: ID) {
    User(id: $id) {
      followedBy {
        id
      }
      followedByCurrentUser
    }
  }
`

beforeAll(() => {
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
      name: 'user1',
      email: 'test@example.org',
      password: '1234',
    })
    .then(user => user.toJson())
  user2 = await factory
    .create('User', {
      id: 'u2',
      name: 'user2',
      email: 'test2@example.org',
      password: '1234',
    })
    .then(user => user.toJson())

  authenticatedUser = user1
  variables = { id: user2.id, type: 'User' }
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('follow', () => {
  describe('follow user', () => {
    describe('unauthenticated follow', () => {
      test('throws authorization error', async () => {
        authenticatedUser = null
        const { errors, data } = await mutate({
          mutation: mutationFollowUser,
          variables,
        })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
        expect(data).toMatchObject({ follow: null })
      })
    })

    test('I can follow another user', async () => {
      const { data: result } = await mutate({
        mutation: mutationFollowUser,
        variables,
      })
      const expectedUser = {
        name: user2.name,
        followedBy: [{ id: user1.id, name: user1.name }],
        followedByCurrentUser: true,
      }
      expect(result).toMatchObject({ follow: expectedUser })
    })

    test('I can`t follow myself', async () => {
      variables.id = user1.id
      const { data: result } = await mutate({ mutation: mutationFollowUser, variables })
      const expectedResult = { follow: null }
      expect(result).toMatchObject(expectedResult)

      const { data } = await query({
        query: userQuery,
        variables: { id: user1.id },
      })
      const expectedUser = {
        followedBy: [],
        followedByCurrentUser: false,
      }
      expect(data).toMatchObject({ User: [expectedUser] })
    })
  })
  describe('unfollow user', () => {
    beforeEach(async () => {
      variables = {
        id: user2.id,
        type: 'User',
      }
      await mutate({ mutation: mutationFollowUser, variables })
    })

    describe('unauthenticated follow', () => {
      test('throws authorization error', async () => {
        authenticatedUser = null
        const { errors, data } = await mutate({ mutation: mutationUnfollowUser, variables })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
        expect(data).toMatchObject({ unfollow: null })
      })
    })

    it('I can unfollow a user', async () => {
      const { data: result } = await mutate({ mutation: mutationUnfollowUser, variables })
      const expectedUser = {
        name: user2.name,
        followedBy: [],
        followedByCurrentUser: false,
      }
      expect(result).toMatchObject({ unfollow: expectedUser })
    })
  })
})
