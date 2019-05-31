import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()
let client

describe('badges', () => {
  beforeEach(async () => {
    await factory.create('User', {
      email: 'user@example.org',
      role: 'user',
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
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('CreateBadge', () => {
    const variables = {
      id: 'b1',
      key: 'indiegogo_en_racoon',
      type: 'crowdfunding',
      status: 'permanent',
      icon: '/img/badges/indiegogo_en_racoon.svg',
    }

    const mutation = `
      mutation(
        $id: ID
        $key: String!
        $type: BadgeType!
        $status: BadgeStatus!
        $icon: String!
      ) {
        CreateBadge(id: $id, key: $key, type: $type, status: $status, icon: $icon) {
          id,
          key,
          type,
          status,
          icon
        }
      }
    `

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated admin', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })
      it('creates a badge', async () => {
        const expected = {
          CreateBadge: {
            icon: '/img/badges/indiegogo_en_racoon.svg',
            id: 'b1',
            key: 'indiegogo_en_racoon',
            status: 'permanent',
            type: 'crowdfunding',
          },
        }
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })
    })

    describe('authenticated moderator', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('throws authorization error', async () => {
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })
  })

  describe('UpdateBadge', () => {
    beforeEach(async () => {
      await factory.authenticateAs({ email: 'admin@example.org', password: '1234' })
      await factory.create('Badge', { id: 'b1' })
    })
    const variables = {
      id: 'b1',
      key: 'whatever',
    }

    const mutation = `
      mutation($id: ID!, $key: String!) {
        UpdateBadge(id: $id, key: $key) {
          id
          key
        }
      }
    `

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated moderator', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('throws authorization error', async () => {
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated admin', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })
      it('updates a badge', async () => {
        const expected = {
          UpdateBadge: {
            id: 'b1',
            key: 'whatever',
          },
        }
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })
    })
  })

  describe('DeleteBadge', () => {
    beforeEach(async () => {
      await factory.authenticateAs({ email: 'admin@example.org', password: '1234' })
      await factory.create('Badge', { id: 'b1' })
    })
    const variables = {
      id: 'b1',
    }

    const mutation = `
      mutation($id: ID!) {
        DeleteBadge(id: $id) {
          id
        }
      }
    `

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated moderator', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      it('throws authorization error', async () => {
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated admin', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })
      it('deletes a badge', async () => {
        const expected = {
          DeleteBadge: {
            id: 'b1',
          },
        }
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })
    })
  })
})
