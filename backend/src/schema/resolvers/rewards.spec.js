import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'

const factory = Factory()
let user
let badge

describe('rewards', () => {
  const variables = {
    from: 'indiegogo_en_rhino',
    to: 'u1',
  }

  beforeEach(async () => {
    user = await factory.create('User', {
      id: 'u1',
      role: 'user',
      email: 'user@example.org',
      password: '1234',
    })
    await factory.create('User', {
      id: 'u2',
      role: 'moderator',
      email: 'moderator@example.org',
    })
    await factory.create('User', {
      id: 'u3',
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
    const mutation = `
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

      describe('badge for id does not exist', () => {
        it('rejects with a telling error message', async () => {
          await expect(
            client.request(mutation, {
              ...variables,
              from: 'bullshit',
            }),
          ).rejects.toThrow("Couldn't find a badge with that id")
        })
      })

      describe('user for id does not exist', () => {
        it('rejects with a telling error message', async () => {
          await expect(
            client.request(mutation, {
              ...variables,
              to: 'bullshit',
            }),
          ).rejects.toThrow("Couldn't find a user with that id")
        })
      })

      it('rewards a badge to user', async () => {
        const expected = {
          reward: {
            id: 'u1',
            badges: [{ id: 'indiegogo_en_rhino' }],
          },
        }
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })

      it('rewards a second different badge to same user', async () => {
        await factory.create('Badge', {
          id: 'indiegogo_en_racoon',
          icon: '/img/badges/indiegogo_en_racoon.svg',
        })
        const expected = {
          reward: {
            id: 'u1',
            badges: [{ id: 'indiegogo_en_racoon' }, { id: 'indiegogo_en_rhino' }],
          },
        }
        await client.request(mutation, variables)
        await expect(
          client.request(mutation, {
            ...variables,
            from: 'indiegogo_en_racoon',
          }),
        ).resolves.toEqual(expected)
      })

      it('rewards the same badge as well to another user', async () => {
        const expected = {
          reward: {
            id: 'u2',
            badges: [{ id: 'indiegogo_en_rhino' }],
          },
        }
        await expect(
          client.request(mutation, {
            ...variables,
            to: 'u2',
          }),
        ).resolves.toEqual(expected)
      })

      it('creates no duplicate reward relationships', async () => {
        await client.request(mutation, variables)
        await client.request(mutation, variables)

        const query = `
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

        await expect(client.request(query)).resolves.toEqual(expected)
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

    const mutation = `
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
        const query = `
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
