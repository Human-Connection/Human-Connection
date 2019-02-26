import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()

describe('report', () => {
  beforeEach(async () => {
    await factory.create('User', {
      email: 'test@example.org',
      password: '1234'
    })
    await factory.create('User', {
      id: 'u2',
      name: 'abusive-user',
      role: 'user',
      email: 'abusive-user@example.org'
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('unauthenticated', () => {
    let client
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(
        client.request(`mutation {
        report(
          description: "I don't like this user",
          resource: {
            id: "u2",
            type: user
          }
        ) { id, createdAt }
      }`)
      ).rejects.toThrow('Not Authorised')
    })

    describe('authenticated', () => {
      let headers
      let response
      beforeEach(async () => {
        headers = await login({ email: 'test@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
        response = await client.request(`mutation {
          report(
            description: "I don't like this user",
            resource: {
              id: "u2",
              type: user
            }
            ) { id, createdAt }
          }`,
        { headers }
        )
      })
      it('creates a report', () => {
        let { id, createdAt } = response.report
        expect(response).toEqual({
          report: { id, createdAt }
        })
      })
    })
  })
})
