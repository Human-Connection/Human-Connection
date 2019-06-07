import { GraphQLClient } from 'graphql-request'
import { host, login } from '../../jest/helpers'
import Factory from '../../seed/factories'
import gql from 'graphql-tag'

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

  describe('DeleteUser', () => {
    let deleteUserVariables
    let asAuthor
    const deleteUserMutation = gql`
      mutation($id: ID!, $resource: [String]) {
        DeleteUser(id: $id, resource: $resource) {
          id
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
        email: 'friendsAccount@example.org',
        password: '1234',
        id: 'u565',
      })
      deleteUserVariables = { id: 'u343' }
    })

    afterEach(async () => {
      await factory.cleanDatabase()
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
        const commentQueryVariables = { id: 'c155' }
        const postQueryVariables = { id: 'p139' }
        const commentQuery = gql`
          query($id: ID) {
            Comment(id: $id) {
              id
            }
          }
        `

        const postQuery = gql`
          query($id: ID) {
            Post(id: $id) {
              id
            }
          }
        `

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
          deleteUserVariables = { id: 'u343' }
        })
        it('deletes my account', async () => {
          const expected = {
            DeleteUser: {
              id: 'u343',
            },
          }
          await expect(client.request(deleteUserMutation, deleteUserVariables)).resolves.toEqual(
            expected,
          )
        })

        describe("doesn't delete a user's", () => {
          it('comments by default', async () => {
            await client.request(deleteUserMutation, deleteUserVariables)
            const { Comment } = await client.request(commentQuery, commentQueryVariables)
            expect(Comment).toEqual([
              {
                id: 'c155',
              },
            ])
          })

          it('posts by default', async () => {
            await client.request(deleteUserMutation, deleteUserVariables)
            const { Post } = await client.request(postQuery, postQueryVariables)
            expect(Post).toEqual([
              {
                id: 'p139',
              },
            ])
          })
        })

        describe("deletes a user's", () => {
          it('posts on request', async () => {
            deleteUserVariables = { id: 'u343', resource: ['Post'] }
            await client.request(deleteUserMutation, deleteUserVariables)
            const { Post } = await client.request(postQuery, postQueryVariables)
            expect(Post).toEqual([])
          })

          it('comments on request', async () => {
            deleteUserVariables = { id: 'u343', resource: ['Comment'] }
            await client.request(deleteUserMutation, deleteUserVariables)
            const { Comment } = await client.request(commentQuery, commentQueryVariables)
            expect(Comment).toEqual([])
          })

          it('posts and comments on request', async () => {
            deleteUserVariables = { id: 'u343', resource: ['Post', 'Comment'] }
            await client.request(deleteUserMutation, deleteUserVariables)
            const { Post } = await client.request(postQuery, postQueryVariables)
            const { Comment } = await client.request(commentQuery, commentQueryVariables)
            expect(Post).toEqual([])
            expect(Comment).toEqual([])
          })
        })
      })
    })
  })
})
