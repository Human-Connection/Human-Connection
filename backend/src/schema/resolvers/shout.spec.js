import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()
let clientUser1, clientUser2
let headersUser1, headersUser2

const mutationShoutPost = id => `
  mutation {
    shout(id: "${id}", type: Post)
  }
`
const mutationUnshoutPost = id => `
  mutation {
    unshout(id: "${id}", type: Post)
  }
`

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

  headersUser1 = await login({ email: 'test@example.org', password: '1234' })
  headersUser2 = await login({ email: 'test2@example.org', password: '1234' })
  clientUser1 = new GraphQLClient(host, { headers: headersUser1 })
  clientUser2 = new GraphQLClient(host, { headers: headersUser2 })

  await clientUser1.request(`
    mutation {
      CreatePost(id: "p1", title: "Post Title 1", content: "Some Post Content 1") {
        id
        title
      }
    }
  `)
  await clientUser2.request(`
  mutation {
      CreatePost(id: "p2", title: "Post Title 2", content: "Some Post Content 2") {
        id
        title
      }
    }
  `)
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('shout', () => {
  describe('shout foreign post', () => {
    describe('unauthenticated shout', () => {
      it('throws authorization error', async () => {
        let client
        client = new GraphQLClient(host)
        await expect(client.request(mutationShoutPost('p1'))).rejects.toThrow('Not Authorised')
      })
    })

    it('I shout a post of another user', async () => {
      const res = await clientUser1.request(mutationShoutPost('p2'))
      const expected = {
        shout: true,
      }
      expect(res).toMatchObject(expected)

      const { Post } = await clientUser1.request(`{
        Post(id: "p2") {
          shoutedByCurrentUser
        }
      }`)
      const expected2 = {
        shoutedByCurrentUser: true,
      }
      expect(Post[0]).toMatchObject(expected2)
    })

    it('I can`t shout my own post', async () => {
      const res = await clientUser1.request(mutationShoutPost('p1'))
      const expected = {
        shout: false,
      }
      expect(res).toMatchObject(expected)

      const { Post } = await clientUser1.request(`{
        Post(id: "p1") {
          shoutedByCurrentUser
        }
      }`)
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
        await clientUser1.request(mutationShoutPost('p2'))
        // unshout
        let client
        client = new GraphQLClient(host)
        await expect(client.request(mutationUnshoutPost('p2'))).rejects.toThrow('Not Authorised')
      })
    })

    it('I unshout a post of another user', async () => {
      // shout
      await clientUser1.request(mutationShoutPost('p2'))
      const expected = {
        unshout: true,
      }
      // unshout
      const res = await clientUser1.request(mutationUnshoutPost('p2'))
      expect(res).toMatchObject(expected)

      const { Post } = await clientUser1.request(`{
        Post(id: "p2") {
          shoutedByCurrentUser
        }
      }`)
      const expected2 = {
        shoutedByCurrentUser: false,
      }
      expect(Post[0]).toMatchObject(expected2)
    })
  })
})
