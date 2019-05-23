import { GraphQLClient } from 'graphql-request'
import { host } from '../jest/helpers'
import Factory from '../seed/factories'

const factory = Factory()
let client

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('users', () => {
  describe('CreateUser', () => {
    const mutation = `
      mutation($name: String, $password: String!, $email: String!) {
        CreateUser(name: $name, password: $password, email: $email) {
          id
        }
      }
    `
    client = new GraphQLClient(host)

    it('with password and email', async () => {
      const variables = {
        name: 'John Doe',
        password: '123',
        email: '123@123.de',
      }
      const expected = {
        CreateUser: {
          id: expect.any(String),
        },
      }
      await expect(client.request(mutation, variables)).resolves.toEqual(expected)
    })
  })

  describe('UpdateUser', () => {
    beforeEach(async () => {
      await factory.create('User', { id: 'u47', name: 'John Doe' })
    })

    const mutation = `
      mutation($id: ID!, $name: String) {
        UpdateUser(id: $id, name: $name) {
          id
          name
        }
      }
    `
    client = new GraphQLClient(host)

    it('name within specifications', async () => {
      const variables = {
        id: 'u47',
        name: 'James Doe',
      }
      const expected = {
        UpdateUser: {
          id: 'u47',
          name: 'James Doe',
        },
      }
      await expect(client.request(mutation, variables)).resolves.toEqual(expected)
    })

    it('with no name', async () => {
      const variables = {
        id: 'u47',
      }
      const expected = 'Username must be at least 3 characters long!'
      await expect(client.request(mutation, variables)).rejects.toThrow(expected)
    })

    it('with too short name', async () => {
      const variables = {
        id: 'u47',
        name: '  ',
      }
      const expected = 'Username must be at least 3 characters long!'
      await expect(client.request(mutation, variables)).rejects.toThrow(expected)
    })
  })
})
