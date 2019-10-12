import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'
import { addMinutes } from 'date-fns'

const factory = Factory()
const driver = getDriver()
const instance = getNeode()

let authenticatedUser, regularUser, administrator, moderator, badge, query, mutate, variables

describe('rewards', () => {
  const variables = {
    from: 'indiegogo_en_rhino',
    to: 'u1',
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
    const mutation = gql`
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
        const variables = {
          from: 'indiegogo_en_rhino',
          to: 'regular-user-id',
        }
        authenticatedUser = null
        await expect(mutate({ mutation, variables })).resolves.toMatchObject({
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
        it('rejects with a telling error message', async () => {
          await expect(
            mutate({ mutation, variables: { to: 'regular-user-id', from: 'ndiegogo_en_rhino' } }),
          ).resolves.toMatchObject({
            data: { reward: null },
            errors: [{ message: "Couldn't find a badge with that id" }],
          })
        })
      })

      describe('user for id does not exist', () => {
        it('rejects with a telling error message', async () => {
          await expect(
            mutate({
              mutation,
              variables: { to: 'non-existent-user-id', from: 'non-existent-badge' },
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
        await expect(
          mutate({ mutation, variables: { to: 'regular-user-id', from: 'indiegogo_en_rhino' } }),
        ).resolves.toMatchObject(expected)
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
          mutation,
          variables: {
            to: 'regular-user-id',
            from: 'indiegogo_en_rhino',
          },
        })
        await expect(
          mutate({
            mutation,
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
          mutation,
          variables: {
            to: 'regular-user-id',
            from: 'indiegogo_en_rhino',
          },
        })
        await expect(
          mutate({
            mutation,
            variables: {
              to: 'regular-user-2-id',
              from: 'indiegogo_en_rhino',
            },
          }),
        ).resolves.toMatchObject(expected)
      })

      it('creates no duplicate reward relationships', async () => {
        await mutate({
          mutation,
          variables: {
            to: 'regular-user-id',
            from: 'indiegogo_en_rhino',
          },
        })
        await mutate({
          mutation,
          variables: {
            to: 'regular-user-id',
            from: 'indiegogo_en_rhino',
          },
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
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      describe('rewards bage to user', () => {
        it('throws authorization error', async () => {
          await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
        })
      })
    })
  })

  describe('unreward', () => {
    beforeEach(async () => {
      await user.relateTo(badge, 'rewarded')
    })
    const expected = { unreward: { id: 'u1', badges: [] } }

    const mutation = gql`
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
        const query = gql`
          {
            User(id: "u1") {
              badgesCount
              badges {
                id
              }
            }
          }
        `
        const expected = { User: [{ badgesCount: 1, badges: [{ id: 'indiegogo_en_rhino' }] }] }
        const client = new GraphQLClient(host)
        await expect(client.request(query)).resolves.toEqual(expected)
      })
    })

    describe('unauthenticated', () => {
      let client

      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated admin', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('removes a badge from user', async () => {
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })

      it('does not crash when unrewarding multiple times', async () => {
        await client.request(mutation, variables)
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })
    })

    describe('authenticated moderator', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      describe('removes bage from user', () => {
        it('throws authorization error', async () => {
          await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
        })
      })
    })
  })
})
