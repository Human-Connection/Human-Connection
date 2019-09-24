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
    describe('authenticated', () => {
      let currentUser, postAuthor
      beforeEach(async () => {
        currentUser = await factory.create('User', {
          id: 'current-user-id',
          name: 'Current User',
          email: 'current.user@example.org',
          password: '1234',
        })

        postAuthor = await factory.create('User', {
          id: 'post-author-id',
          name: 'Post Author',
          email: 'post.author@example.org',
          password: '1234',
        })
        authenticatedUser = await currentUser.toJson()
        await factory.create('Post', {
          name: 'Other user post',
          id: 'other-user-post-id',
          author: postAuthor,
        })
        await factory.create('Post', {
          name: 'current user post',
          id: 'current-user-post-id',
          author: currentUser,
        })
        variables = {}
      })

      it('post of another user', async () => {
        variables = { id: 'other-user-post-id' }
        await expect(mutate({ mutation: mutationShoutPost, variables })).resolves.toMatchObject({
          data: { shout: true },
        })
        await expect(query({ query: queryPost, variables })).resolves.toMatchObject({
          data: { Post: [{ id: 'other-user-post-id', shoutedBy: [{ id: 'current-user-id' }] }] },
          errors: undefined,
        })
      })

      it('my own post', async () => {
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
})

// let clientUser1, clientUser2
// let headersUser1, headersUser2
// const factory = Factory()
// const instance = neode()
// const categoryIds = ['cat9']

// const mutationShoutPost = gql`
//   mutation($id: ID!) {
//     shout(id: $id, type: Post)
//   }
// `
// const mutationUnshoutPost = gql`
//   mutation($id: ID!) {
//     unshout(id: $id, type: Post)
//   }
// `
// const createPostMutation = gql`
//   mutation($id: ID, $title: String!, $content: String!, $categoryIds: [ID]!) {
//     CreatePost(id: $id, title: $title, content: $content, categoryIds: $categoryIds) {
//       id
//       title
//       content
//     }
//   }
// `
// const createPostVariables = {
//   id: 'p1234',
//   title: 'Post Title 1234',
//   content: 'Some Post Content 1234',
//   categoryIds,
// }
// beforeEach(async () => {
//   await factory.create('User', {
//     id: 'u1',
//     email: 'test@example.org',
//     password: '1234',
//   })
//   await factory.create('User', {
//     id: 'u2',
//     email: 'test2@example.org',
//     password: '1234',
//   })
//   await instance.create('Category', {
//     id: 'cat9',
//     name: 'Democracy & Politics',
//     icon: 'university',
//   })
//   headersUser1 = await login({ email: 'test@example.org', password: '1234' })
//   headersUser2 = await login({ email: 'test2@example.org', password: '1234' })
//   clientUser1 = new GraphQLClient(host, { headers: headersUser1 })
//   clientUser2 = new GraphQLClient(host, { headers: headersUser2 })

//   await clientUser1.request(createPostMutation, createPostVariables)
//   await clientUser2.request(createPostMutation, {
//     id: 'p12345',
//     title: 'Post Title 12345',
//     content: 'Some Post Content 12345',
//     categoryIds,
//   })
// })

// afterEach(async () => {
//   await factory.cleanDatabase()
// })

// describe('shout', () => {
//   describe('shout foreign post', () => {
//     describe('unauthenticated shout', () => {
//       it('throws authorization error', async () => {
//         const client = new GraphQLClient(host)
//         await expect(client.request(mutationShoutPost, { id: 'p1234' })).rejects.toThrow(
//           'Not Authorised',
//         )
//       })
//     })

//   describe('unshout foreign post', () => {
//     describe('unauthenticated shout', () => {
//       it('throws authorization error', async () => {
//         // shout
//         await clientUser1.request(mutationShoutPost, { id: 'p12345' })
//         // unshout
//         const client = new GraphQLClient(host)
//         await expect(client.request(mutationUnshoutPost, { id: 'p12345' })).rejects.toThrow(
//           'Not Authorised',
//         )
//       })
//     })

//     it('I unshout a post of another user', async () => {
//       // shout
//       await clientUser1.request(mutationShoutPost, { id: 'p12345' })
//       const expected = {
//         unshout: true,
//       }
//       // unshout
//       const res = await clientUser1.request(mutationUnshoutPost, { id: 'p12345' })
//       expect(res).toMatchObject(expected)

//       const { Post } = await clientUser1.request(gql`
//         query {
//           Post(id: "p12345") {
//             shoutedByCurrentUser
//           }
//         }
//       `)
//       const expected2 = {
//         shoutedByCurrentUser: false,
//       }
//       expect(Post[0]).toMatchObject(expected2)
//     })
//   })
// })
