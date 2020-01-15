import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

let mutate, query, authenticatedUser, variables
const factory = Factory()
const instance = getNeode()
const driver = getDriver()

const mutationShoutPost = gql`
  mutation($id: ID!) {
    shout(id: $id, type: Post)
  }
`
const mutationUnshoutPost = gql`
  mutation($id: ID!) {
    unshout(id: $id, type: Post)
  }
`
const queryPost = gql`
  query($id: ID!) {
    Post(id: $id) {
      id
      shoutedBy {
        id
      }
    }
  }
`

describe('shout and unshout posts', () => {
  let currentUser, postAuthor
  beforeAll(() => {
    authenticatedUser = undefined
    const { server } = createServer({
      context: () => {
        return {
          driver,
          neode: instance,
          user: authenticatedUser,
        }
      },
    })
    mutate = createTestClient(server).mutate
    query = createTestClient(server).query
  })
  beforeEach(async () => {
    currentUser = await factory.create('User', {
      id: 'current-user-id',
      name: 'Current User',
      email: 'current.user@example.org',
      password: '1234',
    })

    postAuthor = await factory.create('User', {
      id: 'id-of-another-user',
      name: 'Another User',
      email: 'another.user@example.org',
      password: '1234',
    })
  })
  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('shout', () => {
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        variables = { id: 'post-to-shout-id' }
        authenticatedUser = undefined
        await expect(mutate({ mutation: mutationShoutPost, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })
    describe('authenticated', () => {
      beforeEach(async () => {
        authenticatedUser = await currentUser.toJson()
        await factory.create('Post', {
          name: 'Other user post',
          id: 'another-user-post-id',
          author: postAuthor,
        })
        await factory.create('Post', {
          name: 'current user post',
          id: 'current-user-post-id',
          author: currentUser,
        })
        variables = {}
      })

      it("can shout another user's post", async () => {
        variables = { id: 'another-user-post-id' }
        await expect(mutate({ mutation: mutationShoutPost, variables })).resolves.toMatchObject({
          data: { shout: true },
        })
        await expect(query({ query: queryPost, variables })).resolves.toMatchObject({
          data: { Post: [{ id: 'another-user-post-id', shoutedBy: [{ id: 'current-user-id' }] }] },
          errors: undefined,
        })
      })

      it('adds `createdAt` to `SHOUT` relationship', async () => {
        variables = { id: 'another-user-post-id' }
        await mutate({ mutation: mutationShoutPost, variables })
        const relation = await instance.cypher(
          'MATCH (user:User {id: $userId1})-[relationship:SHOUTED]->(node {id: $userId2}) WHERE relationship.createdAt IS NOT NULL RETURN relationship',
          {
            userId1: 'current-user-id',
            userId2: 'another-user-post-id',
          },
        )
        const relationshipProperties = relation.records.map(
          record => record.get('relationship').properties.createdAt,
        )
        expect(relationshipProperties[0]).toEqual(expect.any(String))
      })

      it('can not shout my own post', async () => {
        variables = { id: 'current-user-post-id' }
        await expect(mutate({ mutation: mutationShoutPost, variables })).resolves.toMatchObject({
          data: { shout: false },
        })
        await expect(query({ query: queryPost, variables })).resolves.toMatchObject({
          data: { Post: [{ id: 'current-user-post-id', shoutedBy: [] }] },
          errors: undefined,
        })
      })
    })
  })
  describe('unshout', () => {
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = undefined
        variables = { id: 'post-to-shout-id' }
        await expect(mutate({ mutation: mutationUnshoutPost, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        authenticatedUser = await currentUser.toJson()
        await factory.create('Post', {
          name: 'Posted By Another User',
          id: 'posted-by-another-user',
          author: postAuthor,
        })
        await mutate({
          mutation: mutationShoutPost,
          variables: { id: 'posted-by-another-user' },
        })
      })

      it("can unshout another user's post", async () => {
        variables = { id: 'posted-by-another-user' }
        await expect(mutate({ mutation: mutationUnshoutPost, variables })).resolves.toMatchObject({
          data: { unshout: true },
        })
        await expect(query({ query: queryPost, variables })).resolves.toMatchObject({
          data: { Post: [{ id: 'posted-by-another-user', shoutedBy: [] }] },
          errors: undefined,
        })
      })
    })
  })
})
