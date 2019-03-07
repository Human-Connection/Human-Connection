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

  const mutation = `
    mutation {
      report(
        id: "u2",
        description: "I don't like this user"
      ) { description }
    }
  `
  let headers
  beforeEach(async () => {
    headers = {}
  })

  let client
  const action = () => {
    client = new GraphQLClient(host, { headers })
    return client.request(mutation)
  }

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      await expect(action()).rejects.toThrow('Not Authorised')
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        headers = await login({ email: 'test@example.org', password: '1234' })
      })

      it('creates a report', async () => {
        await expect(action()).resolves.toEqual({
          report: { description: 'I don\'t like this user' }
        })
      })
    })
  })
})
