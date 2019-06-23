import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'

const factory = Factory()
let client
let userParams
let authorParams

beforeEach(async () => {
  userParams = {
    name: 'TestUser',
    email: 'test@example.org',
    password: '1234',
  }
  authorParams = {
    email: 'author@example.org',
    password: '1234',
  }
  await factory.create('User', userParams)
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('CreatePost', () => {
  const mutation = `
    mutation {
      CreatePost(title: "I am a title", content: "Some content") {
        title
        content
        slug
        disabled
        deleted
      }
    }
  `

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(mutation)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated', () => {
    let headers
    beforeEach(async () => {
      headers = await login(userParams)
      client = new GraphQLClient(host, { headers })
    })

    it('creates a post', async () => {
      const expected = {
        CreatePost: {
          title: 'I am a title',
          content: 'Some content',
        },
      }
      await expect(client.request(mutation)).resolves.toMatchObject(expected)
    })

    it('assigns the authenticated user as author', async () => {
      await client.request(mutation)
      const { User } = await client.request(
        `{
          User(name: "TestUser") {
            contributions {
              title
            }
          }
        }`,
        { headers },
      )
      expect(User).toEqual([{ contributions: [{ title: 'I am a title' }] }])
    })

    describe('disabled and deleted', () => {
      it('initially false', async () => {
        const expected = { CreatePost: { disabled: false, deleted: false } }
        await expect(client.request(mutation)).resolves.toMatchObject(expected)
      })
    })

    describe('language', () => {
      it('allows a user to set the language of the post', async () => {
        const createPostWithLanguageMutation = `
          mutation {
            CreatePost(title: "I am a title", content: "Some content", language: "en") {
              language
            }
          }
        `
        const expected = { CreatePost: { language: 'en' } }
        await expect(client.request(createPostWithLanguageMutation)).resolves.toEqual(
          expect.objectContaining(expected),
        )
      })
    })
  })
})

describe('UpdatePost', () => {
  const mutation = `
    mutation($id: ID!, $content: String) {
      UpdatePost(id: $id, content: $content) {
        id
        content
      }
    }
  `

  let variables = {
    id: 'p1',
    content: 'New content',
  }

  beforeEach(async () => {
    const asAuthor = Factory()
    await asAuthor.create('User', authorParams)
    await asAuthor.authenticateAs(authorParams)
    await asAuthor.create('Post', {
      id: 'p1',
      content: 'Old content',
    })
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated but not the author', () => {
    let headers
    beforeEach(async () => {
      headers = await login(userParams)
      client = new GraphQLClient(host, { headers })
    })

    it('throws authorization error', async () => {
      await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated as author', () => {
    let headers
    beforeEach(async () => {
      headers = await login(authorParams)
      client = new GraphQLClient(host, { headers })
    })

    it('updates a post', async () => {
      const expected = { UpdatePost: { id: 'p1', content: 'New content' } }
      await expect(client.request(mutation, variables)).resolves.toEqual(expected)
    })
  })
})

describe('DeletePost', () => {
  const mutation = `
    mutation($id: ID!) {
      DeletePost(id: $id) {
        id
        content
      }
    }
  `

  let variables = {
    id: 'p1',
  }

  beforeEach(async () => {
    const asAuthor = Factory()
    await asAuthor.create('User', authorParams)
    await asAuthor.authenticateAs(authorParams)
    await asAuthor.create('Post', {
      id: 'p1',
      content: 'To be deleted',
    })
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated but not the author', () => {
    let headers
    beforeEach(async () => {
      headers = await login(userParams)
      client = new GraphQLClient(host, { headers })
    })

    it('throws authorization error', async () => {
      await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated as author', () => {
    let headers
    beforeEach(async () => {
      headers = await login(authorParams)
      client = new GraphQLClient(host, { headers })
    })

    it('deletes a post', async () => {
      const expected = { DeletePost: { id: 'p1', content: 'To be deleted' } }
      await expect(client.request(mutation, variables)).resolves.toEqual(expected)
    })
  })
})
