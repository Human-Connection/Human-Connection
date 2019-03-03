import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()

describe('badges', () => {
  beforeEach(async () => {
    await factory.create('User', {
      email: 'user@example.org',
      role: 'user',
      password: '1234'
    })
    await factory.create('User', {
      id: 'u2',
      role: 'moderator',
      email: 'moderator@example.org'
    })
    await factory.create('User', {
      id: 'u3',
      role: 'admin',
      email: 'admin@example.org'
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('CreateBadge', () => {
    const params = {
      id: 'b1',
      key: 'indiegogo_en_racoon',
      type: 'crowdfunding',
      status: 'permanent',
      icon: '/img/badges/indiegogo_en_racoon.svg'
    }

    const mutation = `
      mutation(
        $id: ID
        $key: String!
        $type: BadgeTypeEnum!
        $status: BadgeStatusEnum!
        $icon: String!
      ) {
        CreateBadge(id: $id, key: $key, type: $type, status: $status, icon: $icon) {
          id
        }
      }
    `

    describe('unauthenticated', () => {
      let client

      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(
          client.request(mutation, params)
        ).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated admin', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })
      it('creates a badge', async () => {
        const expected = {
          CreateBadge: {
            id: 'b1'
          }
        }
        await expect(client.request(mutation, params)).resolves.toEqual(expected)
      })
    })

    describe('authenticated moderator', () => {
      let client
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('throws authorization error', async () => {
        await expect(
          client.request(mutation, params)
        ).rejects.toThrow('Not Authorised')
      })
    })
  })
})
