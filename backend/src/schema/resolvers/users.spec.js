import { GraphQLClient } from 'graphql-request'
import { login, host } from '../../jest/helpers'
import Factory from '../../seed/factories'
import gql from 'graphql-tag'
import { getDriver } from '../../bootstrap/neo4j'

const factory = Factory()
let client
const driver = getDriver()

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('users', () => {
  describe('User', () => {
    const query = `query($email: String) { User(email: $email) { id } }`
    const variables = { email: 'any-email-address@example.org' }
    beforeEach(() => {
      client = new GraphQLClient(host)
    })

    it('is forbidden', async () => {
      await expect(client.request(query, variables)).rejects.toThrow('Not Authorised')
    })

    describe('as admin', () => {
      beforeEach(async () => {
        const userParams = {
          role: 'admin',
          email: 'admin@example.org',
          password: '1234',
        }
        const factory = Factory()
        await factory.create('User', userParams)
        const headers = await login(userParams)
        client = new GraphQLClient(host, { headers })
      })

      it('is permitted', async () => {
        await expect(client.request(query, variables)).resolves.toEqual({ User: [] })
      })
    })
  })

  describe('CreateUser', () => {
    const mutation = `
      mutation($name: String!, $password: String!, $email: String!, $nonce: String) {
        CreateUser(name: $name, password: $password, email: $email, nonce: $nonce) {
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

        describe('given a SignUp node', () => {
          const userParams = {
            email: 'user@example.org',
            password: '1234',
            name: 'John Doe',
            slug: 'john',
          }

          beforeEach(async () => {
            const session = driver.session()
            const args = {
              id: '123',
              createdAt: new Date().toISOString(),
              email: 'someuser@example.org',
              nonce: '123456',
            }
            await session.run('CREATE (s:SignUp {args})', { args })
            session.close()
          })

          describe('sending a valid nonce', () => {
            const variables = { ...userParams, nonce: '123456' }

            it('creates a user account', async () => {
              const expected = {
                CreateUser: {
                  id: expect.any(String),
                },
              }
              await expect(client.request(mutation, variables)).resolves.toEqual(expected)
            })
          })

          describe('sending invalid nonce', () => {
            const variables = { ...userParams, nonce: 'wut?' }

            it('rejects', async () => {
              await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
            })
          })
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
          email: 'someone-else@example.org',
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

      it('with `null` as name', async () => {
        const variables = {
          id: 'u47',
          name: null,
        }
        const expected = '"name" must be a string'
        await expect(client.request(mutation, variables)).rejects.toThrow(expected)
      })

      it('with too short name', async () => {
        const variables = {
          id: 'u47',
          name: '  ',
        }
        const expected = '"name" length must be at least 3 characters long'
        await expect(client.request(mutation, variables)).rejects.toThrow(expected)
      })
    })
  })

  describe('DeleteUser', () => {
    let deleteUserVariables
    let asAuthor
    const deleteUserMutation = gql`
      mutation($id: ID!, $resource: [String]) {
        DeleteUser(id: $id, resource: $resource) {
          id
          contributions {
            id
            deleted
          }
          comments {
            id
            deleted
          }
        }
      }
    `
    beforeEach(async () => {
      asAuthor = await factory.create('User', {
        email: 'test@example.org',
        password: '1234',
        id: 'u343',
      })
      await factory.create('User', {
        email: 'friends-account@example.org',
        password: '1234',
        id: 'u565',
      })
      deleteUserVariables = { id: 'u343', resource: [] }
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(deleteUserMutation, deleteUserVariables)).rejects.toThrow(
          'Not Authorised',
        )
      })
    })

    describe('authenticated', () => {
      let headers
      beforeEach(async () => {
        headers = await login({
          email: 'test@example.org',
          password: '1234',
        })
        client = new GraphQLClient(host, { headers })
      })

      describe("attempting to delete another user's account", () => {
        it('throws an authorization error', async () => {
          deleteUserVariables = { id: 'u565' }
          await expect(client.request(deleteUserMutation, deleteUserVariables)).rejects.toThrow(
            'Not Authorised',
          )
        })
      })

      describe('attempting to delete my own account', () => {
        let expectedResponse
        beforeEach(async () => {
          await asAuthor.authenticateAs({
            email: 'test@example.org',
            password: '1234',
          })
          await asAuthor.create('Post', {
            id: 'p139',
            content: 'Post by user u343',
          })
          await asAuthor.create('Comment', {
            id: 'c155',
            postId: 'p139',
            content: 'Comment by user u343',
          })
          expectedResponse = {
            DeleteUser: {
              id: 'u343',
              contributions: [{ id: 'p139', deleted: false }],
              comments: [{ id: 'c155', deleted: false }],
            },
          }
        })
        it("deletes my account, but doesn't delete posts or comments by default", async () => {
          await expect(client.request(deleteUserMutation, deleteUserVariables)).resolves.toEqual(
            expectedResponse,
          )
        })

        describe("deletes a user's", () => {
          it('posts on request', async () => {
            deleteUserVariables = { id: 'u343', resource: ['Post'] }
            expectedResponse = {
              DeleteUser: {
                id: 'u343',
                contributions: [{ id: 'p139', deleted: true }],
                comments: [{ id: 'c155', deleted: false }],
              },
            }
            await expect(client.request(deleteUserMutation, deleteUserVariables)).resolves.toEqual(
              expectedResponse,
            )
          })

          it('comments on request', async () => {
            deleteUserVariables = { id: 'u343', resource: ['Comment'] }
            expectedResponse = {
              DeleteUser: {
                id: 'u343',
                contributions: [{ id: 'p139', deleted: false }],
                comments: [{ id: 'c155', deleted: true }],
              },
            }
            await expect(client.request(deleteUserMutation, deleteUserVariables)).resolves.toEqual(
              expectedResponse,
            )
          })

          it('posts and comments on request', async () => {
            deleteUserVariables = { id: 'u343', resource: ['Post', 'Comment'] }
            expectedResponse = {
              DeleteUser: {
                id: 'u343',
                contributions: [{ id: 'p139', deleted: true }],
                comments: [{ id: 'c155', deleted: true }],
              },
            }
            await expect(client.request(deleteUserMutation, deleteUserVariables)).resolves.toEqual(
              expectedResponse,
            )
          })
        })
      })
    })
  })
})
