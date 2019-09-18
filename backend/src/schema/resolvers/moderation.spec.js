import { createTestClient } from 'apollo-server-testing'
import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()
const categoryIds = ['cat9']

let query, mutate, authenticatedUser, variables, currentUser
let createPostVariables
let createCommentVariables

beforeAll(() => {
  authenticatedUser = undefined
  const { server } = createServer({
    context: () => {
      return {
        driver,
        neode,
        user: authenticatedUser,
      }
    },
  })
  mutate = createTestClient(server).mutate
  query = createTestClient(server).query
})

beforeEach(async () => {
  variables = {}
  currentUser = await factory.create('User', {
    id: 'current-user',
    name: 'TestUser',
    email: 'test@example.org',
    password: '1234',
  })

  await Promise.all([
    neode.create('Category', {
      id: 'cat9',
      name: 'Democracy & Politics',
      icon: 'university',
    }),
  ])
  authenticatedUser = null
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('disable', () => {
  const mutation = gql`
    mutation($id: ID!) {
      disable(id: $id)
    }
  `
  let variables

  beforeEach(() => {
    // our defaul set of variables
    variables = {
      id: 'some-resource',
    }
  })
  describe('unauthenticated', () => {
    beforeEach(async () => {
      authenticatedUser = await currentUser.toJson()
    })
    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })
  describe('authenticated', () => {
    describe('i am not a moderator', () => {
      let nonModerator

      beforeEach(async () => {
        nonModerator = await factory.create('User', {
          id: 'non-moderator',
          name: 'Non Moderator',
          email: 'non.moderator@example.org',
          password: '1234',
        })
        authenticatedUser = await nonModerator.toJson()
      })
      it('throws authorization error', async () => {
        const { errors } = await mutate({ mutation, variables })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('I am a moderator', () => {
      let moderator
      beforeEach(async () => {
        moderator = await factory.create('User', {
          id: 'moderator-id',
          name: 'Moderator',
          email: 'moderator@example.org',
          password: '1234',
          role: 'moderator',
        })
        authenticatedUser = await moderator.toJson()
      })

      describe('moderate a resource that is not a (Comment|Post|User) ', () => {
        beforeEach(async () => {
          variables = {
            id: 'sample-tag-id',
          }
          await Promise.all([factory.create('Tag', { id: 'sample-tag-id' })])
        })

        it('returns null', async () => {
          const expected = { data: { disable: null } }
          await expect(mutate({ mutation, variables })).resolves.toMatchObject(expected)
        })
      })

      describe('moderate a comment', () => {
        const commentQuery = gql`
          query($id: ID!) {
            Comment(id: $id) {
              id
              disabled
              disabledBy {
                id
              }
            }
          }
        `
        beforeEach(async () => {
          variables = {}
          await factory.create('Comment', {
            id: 'comment-id',
          })
        })

        it('returns disabled resource id', async () => {
          variables = { id: 'comment-id' }
          const expected = { data: { disable: 'comment-id' } }
          await expect(mutate({ mutation, variables })).resolves.toMatchObject(expected)
        })

        it('changes .disabledBy', async () => {
          variables = { id: 'comment-id' }
          const before = { data: { Comment: [{ id: 'comment-id', disabledBy: null }] } }
          const expected = {
            data: { Comment: [{ id: 'comment-id', disabledBy: { id: 'moderator-id' } }] },
          }
          await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(before)
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: { disable: 'comment-id' },
          })
          await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(expected)
        })

        it('updates .disabled on comment', async () => {
          variables = { id: 'comment-id' }
          const before = { data: { Comment: [{ id: 'comment-id', disabled: false }] } }
          const expected = { data: { Comment: [{ id: 'comment-id', disabled: true }] } }

          await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(before)
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: { disable: 'comment-id' },
          })
          await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(expected)
        })
      })

      describe('moderate a post', () => {
        beforeEach(async () => {
          variables = {}
          await factory.create('Post', {
            id: 'sample-post-id',
          })
        })

        it('returns disabled resource id', async () => {
          variables = { id: 'sample-post-id' }
          const expected = { data: { disable: 'sample-post-id' } }
          await expect(mutate({ mutation, variables })).resolves.toMatchObject(expected)
        })
      })
    })
  })

  // describe('authenticated', () => {
  // beforeEach(() => {
  //   authenticateClient = setupAuthenticateClient({
  //     email: 'user@example.org',
  //     password: '1234',
  //   })
  // })

  // describe('as moderator', () => {

  // describe('on a post', () => {
  //   beforeEach(async () => {
  //

  //     createResource = async () => {
  //       await factory.create('User', { email: 'author@example.org', password: '1234' })
  //       await factory.authenticateAs({ email: 'author@example.org', password: '1234' })
  //       await factory.create('Post', {
  //         id: 'p9', // that's the ID we will look for
  //         categoryIds,
  //       })
  //     }
  //   })

  //   it('returns disabled resource id', async () => {
  //     const expected = { disable: 'p9' }
  //     await setup()
  //     await expect(action()).resolves.toEqual(expected)
  //   })

  //   it('changes .disabledBy', async () => {
  //     const before = { Post: [{ id: 'p9', disabledBy: null }] }
  //     const expected = { Post: [{ id: 'p9', disabledBy: { id: 'u7' } }] }

  //     await setup()
  //     await expect(client.request('{ Post { id,  disabledBy { id } } }')).resolves.toEqual(
  //       before,
  //     )
  //     await action()
  //     await expect(
  //       client.request('{ Post(disabled: true) { id,  disabledBy { id } } }'),
  //     ).resolves.toEqual(expected)
  //   })

  //   it('updates .disabled on post', async () => {
  //     const before = { Post: [{ id: 'p9', disabled: false }] }
  //     const expected = { Post: [{ id: 'p9', disabled: true }] }

  //     await setup()
  //     await expect(client.request('{ Post { id disabled } }')).resolves.toEqual(before)
  //     await action()
  //     await expect(
  //       client.request('{ Post(disabled: true) { id disabled } }'),
  //     ).resolves.toEqual(expected)
  //   })
  // })
  // })
  // })

  // describe('enable', () => {
  //   const mutation = gql`
  //     mutation($id: ID!) {
  //       enable(id: $id)
  //     }
  //   `
  //   const action = async () => {
  //     return client.request(mutation, variables)
  //   }

  // beforeEach(() => {
  // our default set of variables
  //   variables = {
  //     id: 'blabla',
  //   }
  // })

  // it('throws authorization error', async () => {
  //   await setup()
  //   await expect(action()).rejects.toThrow('Not Authorised')
  // })

  // describe('authenticated', () => {
  // beforeEach(() => {
  //   authenticateClient = setupAuthenticateClient({
  //     email: 'user@example.org',
  //     password: '1234',
  //   })
  // })
  // it('throws authorization error', async () => {
  //   await setup()
  //   await expect(action()).rejects.toThrow('Not Authorised')
  // })
  // describe('as moderator', () => {
  //   beforeEach(async () => {
  //     authenticateClient = setupAuthenticateClient({
  //       role: 'moderator',
  //       email: 'someuser@example.org',
  //       password: '1234',
  //     })
  //   })
  //   describe('on something that is not a (Comment|Post|User) ', () => {
  //     beforeEach(async () => {
  //       variables = {
  //         id: 't23',
  //       }
  //       createResource = () => {
  //         // we cannot create a :DISABLED relationship here
  //         return Promise.all([factory.create('Tag', { id: 't23' })])
  //       }
  //     })
  //     it('returns null', async () => {
  //       const expected = { enable: null }
  //       await setup()
  //       await expect(action()).resolves.toEqual(expected)
  //     })
  //   })
  //   describe('on a comment', () => {
  //     beforeEach(async () => {
  //       variables = {
  //         id: 'c456',
  //       }
  //       createPostVariables = {
  //         id: 'p9',
  //         title: 'post to comment on',
  //         content: 'please comment on me',
  //         categoryIds,
  //       }
  //       createCommentVariables = {
  //         id: 'c456',
  //         postId: 'p9',
  //         content: 'this comment was created for this post',
  //       }
  //       createResource = async () => {
  //         await factory.create('User', {
  //           id: 'u123',
  //           email: 'author@example.org',
  //           password: '1234',
  //         })
  //         const asAuthenticatedUser = await factory.authenticateAs({
  //           email: 'author@example.org',
  //           password: '1234',
  //         })
  //         await asAuthenticatedUser.create('Post', createPostVariables)
  //         await asAuthenticatedUser.create('Comment', createCommentVariables)
  //         const disableMutation = gql`
  //           mutation {
  //             disable(id: "c456")
  //           }
  //         `
  //         await factory.mutate(disableMutation) // that's we want to delete
  //       }
  //     })
  //     it('returns disabled resource id', async () => {
  //       const expected = { enable: 'c456' }
  //       await setup()
  //       await expect(action()).resolves.toEqual(expected)
  //     })
  //     it('changes .disabledBy', async () => {
  //       const before = { Comment: [{ id: 'c456', disabledBy: { id: 'u123' } }] }
  //       const expected = { Comment: [{ id: 'c456', disabledBy: null }] }
  //       await setup()
  //       await expect(
  //         client.request('{ Comment(disabled: true) { id,  disabledBy { id } } }'),
  //       ).resolves.toEqual(before)
  //       await action()
  //       await expect(client.request('{ Comment { id,  disabledBy { id } } }')).resolves.toEqual(
  //         expected,
  //       )
  //     })
  //     it('updates .disabled on post', async () => {
  //       const before = { Comment: [{ id: 'c456', disabled: true }] }
  //       const expected = { Comment: [{ id: 'c456', disabled: false }] }
  //       await setup()
  //       await expect(
  //         client.request('{ Comment(disabled: true) { id disabled } }'),
  //       ).resolves.toEqual(before)
  //       await action() // this updates .disabled
  //       await expect(client.request('{ Comment { id disabled } }')).resolves.toEqual(expected)
  //     })
  //   })
  //   describe('on a post', () => {
  //     beforeEach(async () => {
  //       variables = {
  //         id: 'p9',
  //       }
  //       createResource = async () => {
  //         await factory.create('User', {
  //           id: 'u123',
  //           email: 'author@example.org',
  //           password: '1234',
  //         })
  //         await factory.authenticateAs({ email: 'author@example.org', password: '1234' })
  //         await factory.create('Post', {
  //           id: 'p9', // that's the ID we will look for
  //           categoryIds,
  //         })
  //         const disableMutation = gql`
  //           mutation {
  //             disable(id: "p9")
  //           }
  //         `
  //         await factory.mutate(disableMutation) // that's we want to delete
  //       }
  //     })
  //     it('returns disabled resource id', async () => {
  //       const expected = { enable: 'p9' }
  //       await setup()
  //       await expect(action()).resolves.toEqual(expected)
  //     })
  //     it('changes .disabledBy', async () => {
  //       const before = { Post: [{ id: 'p9', disabledBy: { id: 'u123' } }] }
  //       const expected = { Post: [{ id: 'p9', disabledBy: null }] }
  //       await setup()
  //       await expect(
  //         client.request('{ Post(disabled: true) { id,  disabledBy { id } } }'),
  //       ).resolves.toEqual(before)
  //       await action()
  //       await expect(client.request('{ Post { id,  disabledBy { id } } }')).resolves.toEqual(
  //         expected,
  //       )
  //     })
  //     it('updates .disabled on post', async () => {
  //       const before = { Post: [{ id: 'p9', disabled: true }] }
  //       const expected = { Post: [{ id: 'p9', disabled: false }] }
  //       await setup()
  //       await expect(client.request('{ Post(disabled: true) { id disabled } }')).resolves.toEqual(
  //         before,
  //       )
  //       await action() // this updates .disabled
  //       await expect(client.request('{ Post { id disabled } }')).resolves.toEqual(expected)
  //     })
  //   })
  // })
  // })
})
