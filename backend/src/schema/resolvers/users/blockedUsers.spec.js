import { createTestClient } from 'apollo-server-testing'
import createServer from '../../../server'
import Factory from '../../../seed/factories'
import { gql } from '../../../jest/helpers'
import { neode, getDriver } from '../../../bootstrap/neo4j'

const driver = getDriver()
const factory = Factory()
const instance = neode()

let currentUser
let blockedUser
let server

beforeEach(() => {
  currentUser = undefined
  ;({ server } = createServer({
    context: () => {
      return {
        user: currentUser,
        driver,
        cypherParams: {
          currentUserId: currentUser ? currentUser.id : null,
        },
      }
    },
  }))
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('blockedUsers', () => {
  let blockedUserQuery
  beforeEach(() => {
    blockedUserQuery = gql`
      query {
        blockedUsers {
          id
          name
          isBlocked
        }
      }
    `
  })

  it('throws permission error', async () => {
    const { query } = createTestClient(server)
    const result = await query({ query: blockedUserQuery })
    expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
  })

  describe('authenticated and given a blocked user', () => {
    beforeEach(async () => {
      currentUser = await instance.create('User', {
        name: 'Current User',
        id: 'u1',
      })
      blockedUser = await instance.create('User', {
        name: 'Blocked User',
        id: 'u2',
      })
      await currentUser.relateTo(blockedUser, 'blocked')
      currentUser = await currentUser.toJson()
    })

    it('returns a list of blocked users', async () => {
      const { query } = createTestClient(server)
      await expect(query({ query: blockedUserQuery })).resolves.toEqual(
        expect.objectContaining({
          data: {
            blockedUsers: [
              {
                name: 'Blocked User',
                id: 'u2',
                isBlocked: true,
              },
            ],
          },
        }),
      )
    })
  })
})

describe('block', () => {
  let blockAction

  beforeEach(() => {
    currentUser = undefined
    blockAction = (variables) => {
      const { mutate } = createTestClient(server)
      const blockMutation = gql`mutation($id: ID!) {
        block(id: $id) {
          id
          name
          isBlocked
        }
      }`
      return mutate({ mutation: blockMutation, variables })
    }
  })

  it('throws permission error', async () => {
    const result = await blockAction({ id: 'u2' })
    expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      currentUser = await instance.create('User', {
        name: 'Current User',
        id: 'u1',
      })
      currentUser = await currentUser.toJson()
    })

    describe('block yourself', () => {
      it('returns null', async () => {
        await expect(blockAction({ id: 'u1' }))
          .resolves.toEqual(expect.objectContaining({ data: { block: null } }))
      })
    })

    describe('block not existing user', () => {
      it('returns null', async () => {
        await expect(blockAction({ id: 'u2' }))
          .resolves.toEqual(expect.objectContaining({ data: { block: null } }))
      })
    })

    describe('given a to-be-blocked user', () => {
      beforeEach(async () => {
        blockedUser = await instance.create('User', {
          name: 'Blocked User',
          id: 'u2',
        })
      })

      it('blocks a user', async () => {
        await expect(blockAction({ id: 'u2' }))
          .resolves.toEqual(expect.objectContaining({
            data: { block: { id: 'u2', name: 'Blocked User', isBlocked: true} }
          }))
      })

      it('unfollows the user', async () => {
        const user = await instance.find('User', currentUser.id)
        await user.relateTo(blockedUser, 'following')
        const queryUser = gql`query { User(id: "u2") { id isBlocked followedByCurrentUser } }`
        const { query } = createTestClient(server)
        await expect(query({ query: queryUser })).resolves.toEqual(expect.objectContaining({
          data: { User: [{id: "u2", isBlocked: false, followedByCurrentUser: true }] }
        }))
        await blockAction({id: 'u2'})
        await expect(query({ query: queryUser })).resolves.toEqual(expect.objectContaining({
          data: { User: [{id: "u2", isBlocked: true, followedByCurrentUser: false }] }
        }))
      })

      describe('blocked user writes a post', () => {
        it.todo('disappears in the newsfeed of the current user')
      })

      describe('current user writes a post', () => {
        it.todo('disappears in the newsfeed of the blocked user')
      })
    })
  })
})

describe('unblock', () => {
  it.todo('throws permission error')
  describe('authenticated', () => {
    it.todo('throws argument error')
    describe('given a blocked user', () => {
      it.todo('unblocks a user')
      describe('unblocking twice', () => {
        it.todo('has no effect')
      })
    })
  })
})
