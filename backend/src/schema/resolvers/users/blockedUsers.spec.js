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
    blockAction = variables => {
      const { mutate } = createTestClient(server)
      const blockMutation = gql`
        mutation($id: ID!) {
          block(id: $id) {
            id
            name
            isBlocked
          }
        }
      `
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
        await expect(blockAction({ id: 'u1' })).resolves.toEqual(
          expect.objectContaining({ data: { block: null } }),
        )
      })
    })

    describe('block not existing user', () => {
      it('returns null', async () => {
        await expect(blockAction({ id: 'u2' })).resolves.toEqual(
          expect.objectContaining({ data: { block: null } }),
        )
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
        await expect(blockAction({ id: 'u2' })).resolves.toEqual(
          expect.objectContaining({
            data: { block: { id: 'u2', name: 'Blocked User', isBlocked: true } },
          }),
        )
      })

      it('unfollows the user', async () => {
        const user = await instance.find('User', currentUser.id)
        await user.relateTo(blockedUser, 'following')
        const queryUser = gql`
          query {
            User(id: "u2") {
              id
              isBlocked
              followedByCurrentUser
            }
          }
        `
        const { query } = createTestClient(server)
        await expect(query({ query: queryUser })).resolves.toEqual(
          expect.objectContaining({
            data: { User: [{ id: 'u2', isBlocked: false, followedByCurrentUser: true }] },
          }),
        )
        await blockAction({ id: 'u2' })
        await expect(query({ query: queryUser })).resolves.toEqual(
          expect.objectContaining({
            data: { User: [{ id: 'u2', isBlocked: true, followedByCurrentUser: false }] },
          }),
        )
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
  let unblockAction

  beforeEach(() => {
    currentUser = undefined
    unblockAction = variables => {
      const { mutate } = createTestClient(server)
      const unblockMutation = gql`
        mutation($id: ID!) {
          unblock(id: $id) {
            id
            name
            isBlocked
          }
        }
      `
      return mutate({ mutation: unblockMutation, variables })
    }
  })

  it('throws permission error', async () => {
    const result = await unblockAction({ id: 'u2' })
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

    describe('unblock yourself', () => {
      it('returns null', async () => {
        await expect(unblockAction({ id: 'u1' })).resolves.toEqual(
          expect.objectContaining({ data: { unblock: null } }),
        )
      })
    })

    describe('unblock not-existing user', () => {
      it('returns null', async () => {
        await expect(unblockAction({ id: 'lksjdflksfdj' })).resolves.toEqual(
          expect.objectContaining({ data: { unblock: null } }),
        )
      })
    })

    describe('given another user', () => {
      let user, blockedUser

      beforeEach(async () => {
        ;[user, blockedUser] = await Promise.all([
          instance.find('User', 'u1'),
          instance.create('User', {
            name: 'Blocked User',
            id: 'u2',
          }),
        ])
      })

      describe('unblocking a not yet blocked user', () => {
        it('does not hurt', async () => {
          await expect(unblockAction({ id: 'u2' })).resolves.toEqual(
            expect.objectContaining({
              data: { unblock: { id: 'u2', name: 'Blocked User', isBlocked: false } },
            }),
          )
        })
      })

      describe('given a blocked user', () => {
        beforeEach(async () => {
          await user.relateTo(blockedUser, 'blocked')
        })

        it('unblocks a user', async () => {
          await expect(unblockAction({ id: 'u2' })).resolves.toEqual(
            expect.objectContaining({
              data: { unblock: { id: 'u2', name: 'Blocked User', isBlocked: false } },
            }),
          )
        })

        describe('unblocking twice', () => {
          it('has no effect', async () => {
            await unblockAction({ id: 'u2' })
            await expect(unblockAction({ id: 'u2' })).resolves.toEqual(
              expect.objectContaining({
                data: { unblock: { id: 'u2', name: 'Blocked User', isBlocked: false } },
              }),
            )
          })
        })
      })
    })
  })
})
