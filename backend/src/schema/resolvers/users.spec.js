import { GraphQLClient } from 'graphql-request'
import { login, host } from '../../jest/helpers'
import Factory from '../../seed/factories'

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
    describe('given valid password and email', () => {
      const variables = {
        name: 'John Doe',
        password: '123',
        email: '123@123.de',
      }

      describe('unauthenticated', () => {
        beforeEach(async () => {
          client = new GraphQLClient(host)
        })

        it('is not allowed to create users', async () => {
          await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
        })
      })

      describe('authenticated admin', () => {
        beforeEach(async () => {
          const adminParams = {
            role: 'admin',
            email: 'admin@example.org',
            password: '1234',
          }
          await factory.create('User', adminParams)
          const headers = await login(adminParams)
          client = new GraphQLClient(host, { headers })
        })

        it('is allowed to create new users', async () => {
          const expected = {
            CreateUser: {
              id: expect.any(String),
            },
          }
          await expect(client.request(mutation, variables)).resolves.toEqual(expected)
        })
      })
    })
  })

  describe('UpdateUser', () => {
    const userParams = {
      email: 'user@example.org',
      password: '1234',
      id: 'u47',
      name: 'John Doe',
    }
    const variables = {
      id: 'u47',
      name: 'John Doughnut',
    }

    const mutation = `
      mutation($id: ID!, $name: String) {
        UpdateUser(id: $id, name: $name) {
          id
          name
        }
      }
    `

    beforeEach(async () => {
      await factory.create('User', userParams)
    })

    describe('as another user', () => {
      beforeEach(async () => {
        const someoneElseParams = {
          email: 'someoneElse@example.org',
          password: '1234',
          name: 'James Doe',
        }

        await factory.create('User', someoneElseParams)
        const headers = await login(someoneElseParams)
        client = new GraphQLClient(host, { headers })
      })

      it('is not allowed to change other user accounts', async () => {
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('as the same user', () => {
      beforeEach(async () => {
        const headers = await login(userParams)
        client = new GraphQLClient(host, { headers })
      })

      it('name within specifications', async () => {
        const expected = {
          UpdateUser: {
            id: 'u47',
            name: 'John Doughnut',
          },
        }
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })

      it('with no name', async () => {
        const variables = {
          id: 'u47',
          name: null,
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
})
