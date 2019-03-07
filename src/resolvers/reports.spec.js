import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()

describe('report', () => {
  let mutation
  let headers
  beforeEach(async () => {
    headers = {}
    await factory.create('User', {
      id: 'u1',
      email: 'test@example.org',
      password: '1234'
    })
    await factory.create('User', {
      id: 'u2',
      name: 'abusive-user',
      role: 'user',
      email: 'abusive-user@example.org'
    })
    mutation = `
      mutation {
        report(
          id: "u2",
          description: "I don't like this user"
        ) { description }
      }
  `
  })

  afterEach(async () => {
    await factory.cleanDatabase()
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

      it('returns the reporter', async () => {
        mutation = `
          mutation {
            report(
              id: "u2",
              description: "I don't like this user"
            ) { reporter {
                email
            } }
          }
        `
        await expect(action()).resolves.toEqual({
          report: { reporter: { email: 'test@example.org' } }
        })
      })

      it('returns type', async () => {
        mutation = `
          mutation {
            report(
              id: "u2",
              description: "I don't like this user"
            ) { type }
          }
        `
        await expect(action()).resolves.toEqual({
          report: { type: 'User' }
        })
      })

      it('returns user', async () => {
        mutation = `
          mutation {
            report(
              id: "u2",
              description: "I don't like this user"
            ) { user {
                name
            } }
          }
        `
        await expect(action()).resolves.toEqual({
          report: { user: { name: 'abusive-user' } }
        })
      })
    })
  })
})
