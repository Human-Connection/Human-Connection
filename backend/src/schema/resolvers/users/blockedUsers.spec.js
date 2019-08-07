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
  ;({ server } = createServer({
    context: () => {
      return {
        user: currentUser,
        driver,
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
      blockedUser = await blockedUser.toJson()
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
  it.todo('throws permission error')

  describe('authenticated', () => {
    it.todo('throws argument error')

    describe('given a to-be-blocked user', () => {
      it.todo('blocks a user')
      it.todo('removes any `FOLLOW` relationship')

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
