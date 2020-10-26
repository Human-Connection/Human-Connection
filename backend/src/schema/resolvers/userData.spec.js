import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../db/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

let query, authenticatedUser

const driver = getDriver()
const neode = getNeode()

beforeAll(async () => {
  await cleanDatabase()
  const user = await Factory.build('user', {
    id: 'a-user',
    name: 'John Doe',
    slug: 'john-doe',
  })
  await Factory.build('user', {
    id: 'o-user',
    name: 'Unauthenticated User',
    slug: 'unauthenticated-user',
  })
  authenticatedUser = await user.toJson()
  const { server } = createServer({
    context: () => {
      return {
        driver,
        neode,
        user: authenticatedUser,
      }
    },
  })
  query = createTestClient(server).query
})

afterAll(async () => {
  await cleanDatabase()
})

const userDataQuery = gql`
  query($id: ID!) {
    userData(id: $id) {
      user {
        id
        name
        slug
      }
      posts {
        id
        title
        content
        comments {
          content
          author {
            slug
          }
        }
      }
    }
  }
`

describe('resolvers/userData', () => {
  let variables = { id: 'a-user' }

  describe('given one authenticated user who did not write anything so far', () => {
    it("returns the user's data and no posts", async () => {
      await expect(query({ query: userDataQuery, variables })).resolves.toMatchObject({
        data: {
          userData: {
            user: {
              id: 'a-user',
              name: 'John Doe',
              slug: 'john-doe',
            },
            posts: [],
          },
        },
      })
    })

    describe('the user writes a post', () => {
      beforeAll(async () => {
        await Factory.build(
          'post',
          {
            id: 'a-post',
            title: 'A post',
            content: 'A post',
          },
          { authorId: 'a-user' },
        )
      })

      it("returns the user's data and the post", async () => {
        await expect(query({ query: userDataQuery, variables })).resolves.toMatchObject({
          data: {
            userData: {
              user: {
                id: 'a-user',
                name: 'John Doe',
                slug: 'john-doe',
              },
              posts: [
                {
                  id: 'a-post',
                  title: 'A post',
                  content: 'A post',
                },
              ],
            },
          },
        })
      })
    })
  })

  describe('try to request data of another user', () => {
    variables = { id: 'o-user' }
    it('returns the data of the authenticated user', async () => {
      await expect(query({ query: userDataQuery, variables })).resolves.toMatchObject({
        data: {
          userData: {
            user: {
              id: 'a-user',
              name: 'John Doe',
              slug: 'john-doe',
            },
            posts: expect.arrayContaining([
              {
                id: 'a-post',
                title: 'A post',
                content: 'A post',
                comments: [],
              },
            ]),
          },
        },
      })
    })
  })
})
