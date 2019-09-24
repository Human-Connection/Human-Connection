import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
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
const createPostMutation = gql`
  mutation($id: ID, $title: String!, $content: String!, $categoryIds: [ID]!) {
    CreatePost(id: $id, title: $title, content: $content, categoryIds: $categoryIds) {
      id
      title
      content
    }
  }
`
describe('shout and unshout posts', () => {
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

  afterEach(() => {
    factory.cleanDatabase()
  })

  describe('shout', () => {
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        variables = { id: 'post-to-shout-id' }
        await expect(mutate({ mutation: mutationShoutPost, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })
  })
})
