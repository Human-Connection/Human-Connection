import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()

describe('report', () => {
  let mutation
  let headers
  let returnedObject
  let variables

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
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  let client
  const action = () => {
    mutation = `
      mutation($id: ID!) {
        report(
          id: $id,
          description: "Violates code of conduct"
        ) ${returnedObject || '{ description }'}
      }
    `
    variables = variables || { id: 'whatever' }
    client = new GraphQLClient(host, { headers })
    return client.request(mutation, variables)
  }

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      await expect(action()).rejects.toThrow('Not Authorised')
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        headers = await login({ email: 'test@example.org', password: '1234' })
      })

      describe('invalid resource id', () => {
        it('returns null', async () => {
          await expect(action()).resolves.toEqual({
            report: null
          })
        })
      })

      describe('valid resource id', () => {
        beforeEach(async () => {
          variables = {id: 'u2'}
        })

        it('creates a report', async () => {
          await expect(action()).resolves.toEqual({
            report: { description: 'Violates code of conduct' }
          })
        })

        it('returns the submitter', async () => {
          returnedObject = '{ submitter { email } }'
          await expect(action()).resolves.toEqual({
            report: { submitter: { email: 'test@example.org' } }
          })
        })

        describe('reported resource is a user', () => {
          it('returns type "User"', async () => {
            returnedObject = '{ type }'
            await expect(action()).resolves.toEqual({
              report: { type: 'User' }
            })
          })

          it('returns resource in user attribute', async () => {
            returnedObject = '{ user { name } }'
            await expect(action()).resolves.toEqual({
              report: { user: { name: 'abusive-user' } }
            })
          })
        })

        describe('reported resource is a post', () => {
          beforeEach(async () => {
            await factory.authenticateAs({email: 'test@example.org', password: '1234'})
            await factory.create('Post', {id: 'p23', title: 'Matt and Robert having a pair-programming' })
            variables = { id: 'p23' }
          })

          it('returns type "Post"', async () => {
            returnedObject = '{ type }'
            await expect(action()).resolves.toEqual({
              report: { type: 'Post' }
            })
          })

          it('returns resource in post attribute', async () => {
            returnedObject = '{ post { title } }'
            await expect(action()).resolves.toEqual({
              report: { post: { title: 'Matt and Robert having a pair-programming' } }
            })
          })

          it('returns null in user attribute', async () => {
            returnedObject = '{ user { name } }'
            await expect(action()).resolves.toEqual({
              report: { user: null }
            })
          })
        })

        describe('reported resource is a comment', () => {
          beforeEach(async () => {
            await factory.authenticateAs({email: 'test@example.org', password: '1234'})
            await factory.create('Comment', {id: 'c34', content: 'Robert getting tired.' })
            variables = { id: 'c34' }
          })

          it('returns type "Comment"', async () => {
            returnedObject = '{ type }'
            await expect(action()).resolves.toEqual({
              report: { type: 'Comment' }
            })
          })

          it('returns resource in comment attribute', async () => {
            returnedObject = '{ comment { content } }'
            await expect(action()).resolves.toEqual({
              report: { comment: { content: 'Robert getting tired.' } }
            })
          })
        })
      })
    })
  })
})
