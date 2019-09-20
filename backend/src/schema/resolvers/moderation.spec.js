import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()

let query, mutate, authenticatedUser, variables, moderator, nonModerator

const disableMutation = gql`
  mutation($id: ID!) {
    disable(id: $id)
  }
`
const enableMutation = gql`
  mutation($id: ID!) {
    enable(id: $id)
  }
`

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

const postQuery = gql`
  query($id: ID) {
    Post(id: $id) {
      id
      disabled
      disabledBy {
        id
      }
    }
  }
`

describe('moderate resources', () => {
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
    authenticatedUser = null
    moderator = await factory.create('User', {
      id: 'moderator-id',
      name: 'Moderator',
      email: 'moderator@example.org',
      password: '1234',
      role: 'moderator',
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('disable', () => {
    beforeEach(() => {
      variables = {
        id: 'some-resource',
      }
    })
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })
    describe('authenticated', () => {
      describe('non moderator', () => {
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
          await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
            errors: [{ message: 'Not Authorised!' }],
          })
        })
      })

      describe('moderator', () => {
        beforeEach(async () => {
          authenticatedUser = await moderator.toJson()
        })

        describe('moderate a resource that is not a (Comment|Post|User) ', () => {
          beforeEach(async () => {
            variables = {
              id: 'sample-tag-id',
            }
            await factory.create('Tag', { id: 'sample-tag-id' })
          })

          it('returns null', async () => {
            await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
              data: { disable: null },
            })
          })
        })

        describe('moderate a comment', () => {
          beforeEach(async () => {
            variables = {}
            await factory.create('Comment', {
              id: 'comment-id',
            })
          })

          it('returns disabled resource id', async () => {
            variables = { id: 'comment-id' }
            await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
              data: { disable: 'comment-id' },
              errors: undefined,
            })
          })

          it('changes .disabledBy', async () => {
            variables = { id: 'comment-id' }
            const before = { data: { Comment: [{ id: 'comment-id', disabledBy: null }] } }
            const expected = {
              data: { Comment: [{ id: 'comment-id', disabledBy: { id: 'moderator-id' } }] },
            }
            await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(before)
            await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
              data: { disable: 'comment-id' },
            })
            await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(expected)
          })

          it('updates .disabled on comment', async () => {
            variables = { id: 'comment-id' }
            const before = { data: { Comment: [{ id: 'comment-id', disabled: false }] } }
            const expected = { data: { Comment: [{ id: 'comment-id', disabled: true }] } }

            await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(before)
            await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
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
            await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
              data: { disable: 'sample-post-id' },
            })
          })

          it('changes .disabledBy', async () => {
            variables = { id: 'sample-post-id' }
            const before = { data: { Post: [{ id: 'sample-post-id', disabledBy: null }] } }
            const expected = {
              data: { Post: [{ id: 'sample-post-id', disabledBy: { id: 'moderator-id' } }] },
            }

            await expect(query({ query: postQuery, variables })).resolves.toMatchObject(before)
            await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
              data: { disable: 'sample-post-id' },
            })
            await expect(query({ query: postQuery, variables })).resolves.toMatchObject(expected)
          })

          it('updates .disabled on post', async () => {
            const before = { data: { Post: [{ id: 'sample-post-id', disabled: false }] } }
            const expected = { data: { Post: [{ id: 'sample-post-id', disabled: true }] } }
            variables = { id: 'sample-post-id' }

            await expect(query({ query: postQuery, variables })).resolves.toMatchObject(before)
            await expect(mutate({ mutation: disableMutation, variables })).resolves.toMatchObject({
              data: { disable: 'sample-post-id' },
            })
            await expect(query({ query: postQuery, variables })).resolves.toMatchObject(expected)
          })
        })
      })
    })
  })

  describe('enable', () => {
    describe('unautenticated user', () => {
      it('throws authorization error', async () => {
        variables = { id: 'sample-post-id' }
        await expect(mutate({ mutation: enableMutation, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated user', () => {
      describe('non moderator', () => {
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
          variables = { id: 'sample-post-id' }
          await expect(mutate({ mutation: enableMutation, variables })).resolves.toMatchObject({
            errors: [{ message: 'Not Authorised!' }],
          })
        })
      })

      describe('moderator', () => {
        beforeEach(async () => {
          authenticatedUser = await moderator.toJson()
        })
        describe('moderate a resource that is not a (Comment|Post|User) ', () => {
          beforeEach(async () => {
            await Promise.all([factory.create('Tag', { id: 'sample-tag-id' })])
          })

          it('returns null', async () => {
            await expect(
              mutate({ mutation: enableMutation, variables: { id: 'sample-tag-id' } }),
            ).resolves.toMatchObject({
              data: { enable: null },
            })
          })
        })

        describe('moderate a comment', () => {
          beforeEach(async () => {
            variables = { id: 'comment-id' }
            await factory.create('Comment', {
              id: 'comment-id',
            })
            await mutate({ mutation: disableMutation, variables })
          })

          it('returns enabled resource id', async () => {
            await expect(mutate({ mutation: enableMutation, variables })).resolves.toMatchObject({
              data: { enable: 'comment-id' },
              errors: undefined,
            })
          })

          it('changes .disabledBy', async () => {
            const expected = {
              data: { Comment: [{ id: 'comment-id', disabledBy: null }] },
              errors: undefined,
            }
            await expect(mutate({ mutation: enableMutation, variables })).resolves.toMatchObject({
              data: { enable: 'comment-id' },
              errors: undefined,
            })
            await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(expected)
          })

          it('updates .disabled on comment', async () => {
            const expected = {
              data: { Comment: [{ id: 'comment-id', disabled: false }] },
              errors: undefined,
            }

            await expect(mutate({ mutation: enableMutation, variables })).resolves.toMatchObject({
              data: { enable: 'comment-id' },
              errors: undefined,
            })
            await expect(query({ query: commentQuery, variables })).resolves.toMatchObject(expected)
          })
        })

        describe('moderate a post', () => {
          beforeEach(async () => {
            variables = { id: 'post-id' }
            await factory.create('Post', {
              id: 'post-id',
            })
            await mutate({ mutation: disableMutation, variables })
          })

          it('returns enabled resource id', async () => {
            await expect(mutate({ mutation: enableMutation, variables })).resolves.toMatchObject({
              data: { enable: 'post-id' },
              errors: undefined,
            })
          })

          it('changes .disabledBy', async () => {
            const expected = {
              data: { Post: [{ id: 'post-id', disabledBy: null }] },
              errors: undefined,
            }
            await expect(mutate({ mutation: enableMutation, variables })).resolves.toMatchObject({
              data: { enable: 'post-id' },
              errors: undefined,
            })
            await expect(query({ query: postQuery, variables })).resolves.toMatchObject(expected)
          })

          it('updates .disabled on post', async () => {
            const expected = {
              data: { Post: [{ id: 'post-id', disabled: false }] },
              errors: undefined,
            }

            await expect(mutate({ mutation: enableMutation, variables })).resolves.toMatchObject({
              data: { enable: 'post-id' },
              errors: undefined,
            })
            await expect(query({ query: postQuery, variables })).resolves.toMatchObject(expected)
          })
        })
      })
    })
  })
})
