import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

const factory = Factory()
const driver = getDriver()
const instance = getNeode()

let authenticatedUser, regularUser, administrator, moderator, badge, query, mutate

describe('rewards', () => {
  const variables = {
    from: 'indiegogo_en_rhino',
    to: 'regular-user-id',
  }

  beforeAll(async () => {
    const { server } = createServer({
      context: () => {
        return {
          driver,
          neode: instance,
          user: authenticatedUser,
        }
      },
    })
    query = createTestClient(server).query
    mutate = createTestClient(server).mutate
  })

  beforeEach(async () => {
    regularUser = await factory.create('User', {
      id: 'regular-user-id',
      role: 'user',
      email: 'user@example.org',
      password: '1234',
    })
    moderator = await factory.create('User', {
      id: 'moderator-id',
      role: 'moderator',
      email: 'moderator@example.org',
    })
    administrator = await factory.create('User', {
      id: 'admin-id',
      role: 'admin',
      email: 'admin@example.org',
    })
    badge = await factory.create('Badge', {
      id: 'indiegogo_en_rhino',
      type: 'crowdfunding',
      status: 'permanent',
      icon: '/img/badges/indiegogo_en_rhino.svg',
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('reward', () => {
    const rewardMutation = gql`
      mutation($from: ID!, $to: ID!) {
        reward(badgeKey: $from, userId: $to) {
          id
          badges {
            id
          }
        }
      }
    `

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = null
        await expect(mutate({ mutation: rewardMutation, variables })).resolves.toMatchObject({
          data: { reward: null },
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated admin', () => {
      beforeEach(async () => {
        authenticatedUser = await administrator.toJson()
      })

      describe('badge for id does not exist', () => {
        it('rejects with an informative error message', async () => {
          await expect(
            mutate({
              mutation: rewardMutation,
              variables: { to: 'regular-user-id', from: 'non-existent-badge-id' },
            }),
          ).resolves.toMatchObject({
            data: { reward: null },
            errors: [{ message: "Couldn't find a badge with that id" }],
          })
        })
      })

      describe('non-existent user', () => {
        it('rejects with a telling error message', async () => {
          await expect(
            mutate({
              mutation: rewardMutation,
              variables: { to: 'non-existent-user-id', from: 'indiegogo_en_rhino' },
            }),
          ).resolves.toMatchObject({
            data: { reward: null },
            errors: [{ message: "Couldn't find a user with that id" }],
          })
        })
      })

      it('rewards a badge to user', async () => {
        const expected = {
          data: {
            reward: {
              id: 'regular-user-id',
              badges: [{ id: 'indiegogo_en_rhino' }],
            },
          },
          errors: undefined,
        }
        await expect(mutate({ mutation: rewardMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })

      it('rewards a second different badge to same user', async () => {
        await factory.create('Badge', {
          id: 'indiegogo_en_racoon',
          icon: '/img/badges/indiegogo_en_racoon.svg',
        })
        const badges = [{ id: 'indiegogo_en_racoon' }, { id: 'indiegogo_en_rhino' }]
        const expected = {
          data: {
            reward: {
              id: 'regular-user-id',
              badges: expect.arrayContaining(badges),
            },
          },
          errors: undefined,
        }
        await mutate({
          mutation: rewardMutation,
          variables: {
            to: 'regular-user-id',
            from: 'indiegogo_en_rhino',
          },
        })
        await expect(
          mutate({
            mutation: rewardMutation,
            variables: {
              to: 'regular-user-id',
              from: 'indiegogo_en_racoon',
            },
          }),
        ).resolves.toMatchObject(expected)
      })

      it('rewards the same badge as well to another user', async () => {
        const expected = {
          data: {
            reward: {
              id: 'regular-user-2-id',
              badges: [{ id: 'indiegogo_en_rhino' }],
            },
          },
          errors: undefined,
        }
        await factory.create('User', {
          id: 'regular-user-2-id',
          email: 'regular2@email.com',
        })
        await mutate({
          mutation: rewardMutation,
          variables,
        })
        await expect(
          mutate({
            mutation: rewardMutation,
            variables: {
              to: 'regular-user-2-id',
              from: 'indiegogo_en_rhino',
            },
          }),
        ).resolves.toMatchObject(expected)
      })

      it('creates no duplicate reward relationships', async () => {
        await mutate({
          mutation: rewardMutation,
          variables,
        })
        await mutate({
          mutation: rewardMutation,
          variables,
        })

        const userQuery = gql`
          {
            User(id: "regular-user-id") {
              badgesCount
              badges {
                id
              }
            }
          }
        `
        const expected = {
          data: { User: [{ badgesCount: 1, badges: [{ id: 'indiegogo_en_rhino' }] }] },
          errors: undefined,
        }

        await expect(query({ query: userQuery })).resolves.toMatchObject(expected)
      })
    })

    describe('authenticated moderator', () => {
      beforeEach(async () => {
        authenticatedUser = moderator.toJson()
      })

      describe('rewards badge to user', () => {
        it('throws authorization error', async () => {
          await expect(mutate({ mutation: rewardMutation, variables })).resolves.toMatchObject({
            data: { reward: null },
            errors: [{ message: 'Not Authorised!' }],
          })
        })
      })
    })
  })

  describe('unreward', () => {
    beforeEach(async () => {
      await regularUser.relateTo(badge, 'rewarded')
    })
    const expected = {
      data: { unreward: { id: 'regular-user-id', badges: [] } },
      errors: undefined,
    }

    const unrewardMutation = gql`
      mutation($from: ID!, $to: ID!) {
        unreward(badgeKey: $from, userId: $to) {
          id
          badges {
            id
          }
        }
      }
    `

    describe('check test setup', () => {
      it('user has one badge', async () => {
        authenticatedUser = regularUser.toJson()
        const userQuery = gql`
          {
            User(id: "regular-user-id") {
              badgesCount
              badges {
                id
              }
            }
          }
        `
        const expected = {
          data: { User: [{ badgesCount: 1, badges: [{ id: 'indiegogo_en_rhino' }] }] },
          errors: undefined,
        }
        await expect(query({ query: userQuery })).resolves.toMatchObject(expected)
      })
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = null
        await expect(mutate({ mutation: unrewardMutation, variables })).resolves.toMatchObject({
          data: { unreward: null },
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated admin', () => {
      beforeEach(async () => {
        authenticatedUser = await administrator.toJson()
      })

      it('removes a badge from user', async () => {
        await expect(mutate({ mutation: unrewardMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })

      it('does not crash when unrewarding multiple times', async () => {
        await mutate({ mutation: unrewardMutation, variables })
        await expect(mutate({ mutation: unrewardMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })
    })

    describe('authenticated moderator', () => {
      beforeEach(async () => {
        authenticatedUser = await moderator.toJson()
      })

      describe('removes bage from user', () => {
        it('throws authorization error', async () => {
          await expect(mutate({ mutation: unrewardMutation, variables })).resolves.toMatchObject({
            data: { unreward: null },
            errors: [{ message: 'Not Authorised!' }],
          })
        })
      })
    })
  })
})
