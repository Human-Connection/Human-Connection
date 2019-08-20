import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login, gql } from '../../jest/helpers'
import { neode } from '../../bootstrap/neo4j'

let clientUser1, clientUser2
let headersUser1, headersUser2
const factory = Factory()
const instance = neode()
const categoryIds = ['cat9']

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
const createPostVariables = {
  id: 'p1234',
  title: 'Post Title 1234',
  content: 'Some Post Content 1234',
  categoryIds,
}
beforeEach(async () => {
  await factory.create('User', {
    id: 'u1',
    email: 'test@example.org',
    password: '1234',
  })
  await factory.create('User', {
    id: 'u2',
    email: 'test2@example.org',
    password: '1234',
  })
  await instance.create('Category', {
    id: 'cat9',
    name: 'Democracy & Politics',
    icon: 'university',
  })
  headersUser1 = await login({ email: 'test@example.org', password: '1234' })
  headersUser2 = await login({ email: 'test2@example.org', password: '1234' })
  clientUser1 = new GraphQLClient(host, { headers: headersUser1 })
  clientUser2 = new GraphQLClient(host, { headers: headersUser2 })

  await clientUser1.request(createPostMutation, createPostVariables)
  await clientUser2.request(createPostMutation, {
    id: 'p12345',
    title: 'Post Title 12345',
    content: 'Some Post Content 12345',
    categoryIds,
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('shout', () => {
  describe('shout foreign post', () => {
    describe('unauthenticated shout', () => {
      it('throws authorization error', async () => {
        const client = new GraphQLClient(host)
        await expect(client.request(mutationShoutPost, { id: 'p1234' })).rejects.toThrow(
          'Not Authorised',
        )
      })
    })

    it('I shout a post of another user', async () => {
      const res = await clientUser1.request(mutationShoutPost, { id: 'p12345' })
      const expected = {
        shout: true,
      }
      expect(res).toMatchObject(expected)

      const { Post } = await clientUser1.request(gql`
        query {
          Post(id: "p12345") {
            shoutedByCurrentUser
          }
        }
      `)
      const expected2 = {
        shoutedByCurrentUser: true,
      }
      expect(Post[0]).toMatchObject(expected2)
    })

    it('I can`t shout my own post', async () => {
      const res = await clientUser1.request(mutationShoutPost, { id: 'p1234' })
      const expected = {
        shout: false,
      }
      expect(res).toMatchObject(expected)

      const { Post } = await clientUser1.request(gql`
        query {
          Post(id: "p1234") {
            shoutedByCurrentUser
          }
        }
      `)
      const expected2 = {
        shoutedByCurrentUser: false,
      }
      expect(Post[0]).toMatchObject(expected2)
    })
  })

  describe('unshout foreign post', () => {
    describe('unauthenticated shout', () => {
      it('throws authorization error', async () => {
        // shout
        await clientUser1.request(mutationShoutPost, { id: 'p12345' })
        // unshout
        const client = new GraphQLClient(host)
        await expect(client.request(mutationUnshoutPost, { id: 'p12345' })).rejects.toThrow(
          'Not Authorised',
        )
      })
    })

    it('I unshout a post of another user', async () => {
      // shout
      await clientUser1.request(mutationShoutPost, { id: 'p12345' })
      const expected = {
        unshout: true,
      }
      // unshout
      const res = await clientUser1.request(mutationUnshoutPost, { id: 'p12345' })
      expect(res).toMatchObject(expected)

      const { Post } = await clientUser1.request(gql`
        query {
          Post(id: "p12345") {
            shoutedByCurrentUser
          }
        }
      `)
      const expected2 = {
        shoutedByCurrentUser: false,
      }
      expect(Post[0]).toMatchObject(expected2)
    })
  })
})
