import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login, gql } from '../../jest/helpers'
import { neode } from '../../bootstrap/neo4j'

let client
const factory = Factory()
const instance = neode()
const categoryIds = ['cat9']

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('users', () => {
  describe('User', () => {
    describe('query by email address', () => {
      beforeEach(async () => {
        await factory.create('User', { name: 'Johnny', email: 'any-email-address@example.org' })
      })

      const query = `query($email: String) { User(email: $email) { name } }`
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
          await expect(client.request(query, variables)).resolves.toEqual({
            User: [{ name: 'Johnny' }],
          })
        })
      })
    })
  })

  describe('UpdateUser', () => {
    let userParams
    let variables

    beforeEach(async () => {
      userParams = {
        email: 'user@example.org',
        password: '1234',
        id: 'u47',
        name: 'John Doe',
      }
    
      variables = {
        id: 'u47',
        name: 'John Doughnut',
      }
  })

      
    const UpdateUserMutation = gql`
      mutation($id: ID!, $name: String, $termsAndConditionsAgreedVersion: String) {
        UpdateUser(id: $id, name: $name, termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion) {
          id
          name
          termsAndConditionsAgreedVersion
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
        await expect(client.request(UpdateUserMutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('as the same user', () => {
      beforeEach(async () => {
        const headers = await login(userParams)
        client = new GraphQLClient(host, { headers })
      })

      it('name within specifications', async () => {
        const expected = {
          UpdateUser: expect.objectContaining({
            id: 'u47',
            name: 'John Doughnut',
          }),
        }
        await expect(client.request(UpdateUserMutation, variables)).resolves.toEqual(expected)
      })

      it('with `null` as name', async () => {
        variables.name = null        
        const expected = '"name" must be a string'
        await expect(client.request(UpdateUserMutation, variables)).rejects.toThrow(expected)
      })

      it('with too short name', async () => {
        const variables = {
          id: 'u47',
          name: '  ',
        }
        const expected = '"name" length must be at least 3 characters long'
        await expect(client.request(UpdateUserMutation, variables)).rejects.toThrow(expected)
      })

     
     
          it ('given a new agreed version of terms and conditions', async () =>  {    
            variables = { ...variables, termsAndConditionsAgreedVersion: '0.0.2'  }
            const expected = {
              UpdateUser: expect.objectContaining({
                termsAndConditionsAgreedVersion: '0.0.2'              
              })
            } 
            await expect(client.request(UpdateUserMutation, variables)).resolves.toEqual(expected)
          })

          it('rejects if version of terms and conditions has wrong format', async () => {
            const expected = {
              UpdateUser: expect.objectContaining({
                termsAndConditionsAgreedVersion: 'invalid version format'              
              })
            } 
            await expect(client.request(UpdateUserMutation, {...variables, termsAndConditionsAgreedVersion: 'invalid version format'})).rejects.toThrow(
              'Invalid version format!',
            )
          })

          
    })
  })

  describe('DeleteUser', () => {
    let deleteUserVariables
    let asAuthor
    const deleteUserMutation = gql`
      mutation($id: ID!, $resource: [Deletable]) {
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
      await factory.create('User', {
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
          asAuthor = Factory()
          await asAuthor.authenticateAs({
            email: 'test@example.org',
            password: '1234',
          })
          await instance.create('Category', {
            id: 'cat9',
            name: 'Democracy & Politics',
            icon: 'university',
          })
          await asAuthor.create('Post', {
            id: 'p139',
            content: 'Post by user u343',
            categoryIds,
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
