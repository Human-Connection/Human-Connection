import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { getDriver, getNeode } from '../../bootstrap/neo4j'
import createServer from '../../server'
import { gql } from '../../helpers/jest'

const factory = Factory()
const driver = getDriver()
const neode = getNeode()

let query
let mutate
let authenticatedUser

let user1
let user2
let variables

const mutationFollowUser = gql`
  mutation($id: ID!) {
    followUser(id: $id) {
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
  mutation($id: ID!) {
    unfollowUser(id: $id) {
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

beforeAll(async () => {
  await factory.cleanDatabase()
  const { server } = createServer({
    context: () => ({
      driver,
      neode,
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
  variables = { id: user2.id }
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('follow', () => {
  describe('follow user', () => {
    describe('unauthenticated follow', () => {
      test('throws authorization error', async () => {
        authenticatedUser = null
        await expect(
          mutate({
            mutation: mutationFollowUser,
            variables,
          }),
        ).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
          data: { followUser: null },
        })
      })
    })

    test('I can follow another user', async () => {
      const expectedUser = {
        name: user2.name,
        followedBy: [{ id: user1.id, name: user1.name }],
        followedByCurrentUser: true,
      }
      await expect(
        mutate({
          mutation: mutationFollowUser,
          variables,
        }),
      ).resolves.toMatchObject({
        data: { followUser: expectedUser },
        errors: undefined,
      })
    })

    test('adds `createdAt` to `FOLLOW` relationship', async () => {
      await mutate({
        mutation: mutationFollowUser,
        variables,
      })
      const relation = await neode.cypher(
        'MATCH (user:User {id: {id}})-[relationship:FOLLOWS]->(followed:User) WHERE relationship.createdAt IS NOT NULL RETURN relationship',
        { id: 'u1' },
      )
      const relationshipProperties = relation.records.map(
        record => record.get('relationship').properties.createdAt,
      )
      expect(relationshipProperties[0]).toEqual(expect.any(String))
    })

    test('I can`t follow myself', async () => {
      variables.id = user1.id
      await expect(mutate({ mutation: mutationFollowUser, variables })).resolves.toMatchObject({
        data: { followUser: null },
        errors: undefined,
      })

      const expectedUser = {
        followedBy: [],
        followedByCurrentUser: false,
      }
      await expect(
        query({
          query: userQuery,
          variables: { id: user1.id },
        }),
      ).resolves.toMatchObject({
        data: {
          User: [expectedUser],
        },
        errors: undefined,
      })
    })
  })

  describe('unfollow user', () => {
    beforeEach(async () => {
      variables = { id: user2.id }
      await mutate({ mutation: mutationFollowUser, variables })
    })

    describe('unauthenticated follow', () => {
      test('throws authorization error', async () => {
        authenticatedUser = null
        await expect(mutate({ mutation: mutationUnfollowUser, variables })).resolves.toMatchObject({
          data: { unfollowUser: null },
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    test('I can unfollow a user', async () => {
      const expectedUser = {
        name: user2.name,
        followedBy: [],
        followedByCurrentUser: false,
      }
      await expect(mutate({ mutation: mutationUnfollowUser, variables })).resolves.toMatchObject({
        data: { unfollowUser: expectedUser },
        errors: undefined,
      })
    })
  })
})
