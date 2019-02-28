import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()

describe('report', () => {
  beforeEach(async () => {
    await factory.create('User', {
      email: 'user@example.org',
      password: '1234'
    })
    await factory.create('User', {
      id: 'u2',
      name: 'moderator',
      role: 'moderator',
      email: 'moderator@example.org'
    })
    await factory.create('User', {
      id: 'u3',
      name: 'admin',
      role: 'moderator',
      email: 'admin@example.org'
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  const params = {
    id: 'b1',
    key: 'indiegogo_en_racoon',
    type: 'crowdfunding',
    status: 'permanent',
    icon: '/img/badges/indiegogo_en_racoon.svg'
  }

  describe('unauthenticated', () => {
    let client

    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      let { id, key, type, status, icon } = params
      await expect(
        client.request(`mutation {
        CreateBadge(
          id: "${id}",
          key: "${key}",
          type: ${type},
          status: ${status},
          icon: "${icon}"
        ) { id }
      }`)
      ).rejects.toThrow('Not Authorised')
    })

    describe('authenticated admin', () => {
      let headers
      let response
      let { id, key, type, status, icon } = params
      beforeEach(async () => {
        headers = await login({ email: 'admin@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
        response = await client.request(`mutation {
          CreateBadge(
              id: "${id}",
              key: "${key}",
              type: ${type},
              status: ${status},
              icon: "${icon}"
            ) { id }
          }`,
        { headers }
        )
      })
      it('creates a badge', () => {
        let { id } = response.CreateBadge
        expect(response).toEqual({
          CreateBadge: { id }
        })
      })
    })
  })
})
