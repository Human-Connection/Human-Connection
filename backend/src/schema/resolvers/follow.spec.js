import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

const driver = getDriver()
const neode = getNeode()
const factory = Factory()

let authenticatedUser, variables, mutate, currentUser, query, followedUser

const mutationFollowUser = gql`
  mutation($id: ID!, $type: FollowTypeEnum) {
    follow(id: $id, type: $type)
  }
`
const mutationUnfollowUser = gql`
  mutation($id: ID!, $type: FollowTypeEnum) {
    unfollow(id: $id, type: $type)
  }
`

const followedUserQuery = gql`
  query($id: ID) {
    User(id: $id) {
      followedBy {
        id
        name
      }
      followedByCurrentUser
    }
  }
`

beforeAll(() => {
  authenticatedUser = undefined
  const { server } = createServer({
    context: () => {
      return {
        driver,
        user: authenticatedUser,
        neode,
        cypherParams: {
          currentUserId: authenticatedUser ? authenticatedUser.id : null,
        },
      }
    },
  })
  mutate = createTestClient(server).mutate
  query = createTestClient(server).query
})

beforeEach(async () => {
  variables = {}
  currentUser = await factory.create('User', {
    id: 'current-user',
    email: 'test@example.org',
    password: '1234',
  })
  followedUser = await factory.create('User', {
    id: 'followed-user',
    email: 'test2@example.org',
    password: '1234',
  })

  authenticatedUser = null
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('follow', () => {
  describe('follow user', () => {
    describe('unauthenticated follow', () => {
      it('throws authorization error', async () => {
        variables = { ...variables, id: 'followed-user' }
        const { errors } = await mutate({ mutation: mutationFollowUser, variables })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated follow', () => {
      beforeEach(async () => {
        authenticatedUser = await currentUser.toJson()
      })

      it('I can follow another user', async () => {
        const expected = {
          data: {
            follow: true,
          },
        }
        variables = { ...variables, id: 'followed-user', type: 'User' }
        await expect(mutate({ mutation: mutationFollowUser, variables })).resolves.toMatchObject(
          expected,
        )

        const expectedFollowedUser = {
          data: { User: [{ followedBy: [{ id: 'current-user' }], followedByCurrentUser: true }] },
        }
        variables = { id: 'followed-user' }
        query({ query: followedUserQuery, variables })
        await expect(query({ query: followedUserQuery, variables })).resolves.toMatchObject(
          expectedFollowedUser,
        )
      })

      it('I can`t follow myself', async () => {
        const expected = {
          data: {
            follow: false,
          },
        }
        variables = { ...variables, id: 'current-user', type: 'User' }
        await expect(mutate({ mutation: mutationFollowUser, variables })).resolves.toMatchObject(
          expected,
        )
        const expectedFollowedUser = {
          data: { User: [{ followedBy: [], followedByCurrentUser: false }] },
        }
        variables = { id: 'followed-user' }
        query({ query: followedUserQuery, variables })
        await expect(query({ query: followedUserQuery, variables })).resolves.toMatchObject(
          expectedFollowedUser,
        )
      })
    })
  })

  describe('unfollow user', () => {
    describe('unauthenticated unfollow', () => {
      it('throws authorization error', async () => {
        variables = { ...variables, id: 'followed-user' }
        const { errors } = await mutate({ mutation: mutationUnfollowUser, variables })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated user', () => {
      beforeEach(async () => {
        authenticatedUser = await currentUser.toJson()
      })
      it('can unfollow a user I follow', async () => {
        // follow
        const mutationVariables = { ...variables, id: 'followed-user', type: 'User' }
        const queryVariables = { id: 'followed-user' }

        const expectedFollow = { data: { follow: true } }
        await expect(
          mutate({ mutation: mutationFollowUser, variables: mutationVariables }),
        ).resolves.toMatchObject(expectedFollow)
        const expectedFollowedUser = {
          data: { User: [{ followedBy: [{ id: 'current-user' }], followedByCurrentUser: true }] },
        }
        variables = { id: 'followed-user' }
        query({ query: followedUserQuery, variables })
        await expect(
          query({ query: followedUserQuery, variables: queryVariables }),
        ).resolves.toMatchObject(expectedFollowedUser)

        // unfollow
        const expectedUnfollow = {
          data: {
            unfollow: true,
          },
        }
        await expect(
          mutate({ mutation: mutationUnfollowUser, variables: mutationVariables }),
        ).resolves.toMatchObject(expectedUnfollow)

        const expectedUserAfterUnfollow = {
          data: { User: [{ followedBy: [], followedByCurrentUser: false }] },
        }
        variables = { id: 'followed-user' }
        await expect(
          query({ query: followedUserQuery, variables: queryVariables }),
        ).resolves.toMatchObject(expectedUserAfterUnfollow)
      })
    })
  })
})
