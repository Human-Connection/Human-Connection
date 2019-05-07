import { GraphQLClient } from 'graphql-request'
import { host } from '../jest/helpers'
import Factory from '../seed/factories'

const factory = Factory()
let client

afterAll(async () => {
  await factory.cleanDatabase()
})

describe('userMiddleware', () => {
  describe('create User', () => {
    const mutation = `
      mutation($id: ID, $password: String!, $email: String!) {
        CreateUser(id: $id, password: $password, email: $email) {
          id
        }
      }
    `
    client = new GraphQLClient(host)

    it('with password and email', async () => {
      const variables = {
        password: '123',
        email: '123@123.de'
      }
      const expected = {
        CreateUser: {
          id: expect.any(String)
        }
      }
      await expect(client.request(mutation, variables))
        .resolves.toEqual(expected)
    })
  })

  describe('update User', () => {
    const mutation = `
      mutation($id: ID!, $name: String) {
        UpdateUser(id: $id, name: $name) {
          name
        }
      }
    `
    client = new GraphQLClient(host)

    it('name within specifications', async () => {
      const variables = {
        id: 'u1',
        name: 'Peter Lustig'
      }
      const expected = {
        UpdateUser: {
          name: 'Peter Lustig'
        }
      }
      await expect(client.request(mutation, variables))
        .resolves.toEqual(expected)
    })

    it('with no name', async () => {
      const variables = {
        id: 'u1'
      }
      const expected = 'Username must be at least 3 characters long!'
      await expect(client.request(mutation, variables))
        .rejects.toThrow(expected)
    })

    it('with too short name', async () => {
      const variables = {
        id: 'u1'
      }
      const expected = 'Username must be at least 3 characters long!'
      await expect(client.request(mutation, variables))
        .rejects.toThrow(expected)
    })
  })
})
